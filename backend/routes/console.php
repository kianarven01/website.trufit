<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

// BLOCK dangerous migration commands — base tables are created outside Laravel migrations
Artisan::command('migrate:fresh', function () {
    $this->error('╔══════════════════════════════════════════════════════════╗');
    $this->error('║  DANGEROUS: migrate:fresh is PROHIBITED on this app.   ║');
    $this->error('║                                                        ║');
    $this->error('║  Base tables were created outside Laravel migrations.  ║');
    $this->error('║  Running this WILL DESTROY the database irreversibly.  ║');
    $this->error('║                                                        ║');
    $this->error('║  Use: php artisan migrate --force                      ║');
    $this->error('║  To rebuild from scratch: php artisan db:load-schema   ║');
    $this->error('╚══════════════════════════════════════════════════════════╝');
    return 1;
})->purpose('BLOCKED — use migrate instead');

Artisan::command('migrate:refresh', function () {
    $this->error('╔══════════════════════════════════════════════════════════╗');
    $this->error('║  DANGEROUS: migrate:refresh is PROHIBITED on this app. ║');
    $this->error('║  Use: php artisan migrate --force                      ║');
    $this->error('╚══════════════════════════════════════════════════════════╝');
    return 1;
})->purpose('BLOCKED — use migrate instead');

Artisan::command('migrate:reset', function () {
    $this->error('╔══════════════════════════════════════════════════════════╗');
    $this->error('║  DANGEROUS: migrate:reset is PROHIBITED on this app.   ║');
    $this->error('║  Use: php artisan migrate --force                      ║');
    $this->error('╚══════════════════════════════════════════════════════════╝');
    return 1;
})->purpose('BLOCKED — use migrate instead');

Artisan::command('db:wipe', function () {
    $this->error('╔══════════════════════════════════════════════════════════╗');
    $this->error('║  DANGEROUS: db:wipe is PROHIBITED on this app.         ║');
    $this->error('║  This would destroy all base tables.                   ║');
    $this->error('╚══════════════════════════════════════════════════════════╝');
    return 1;
})->purpose('BLOCKED — base tables must be preserved');

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('db:load-schema', function () {
    $this->info('Starting database schema loading...');

    // 1. Drop and recreate schemas to start from a completely clean slate
    DB::statement('DROP SCHEMA IF EXISTS "Main" CASCADE');
    DB::statement('DROP SCHEMA IF EXISTS "auth" CASCADE');
    DB::statement('CREATE SCHEMA "Main"');
    DB::statement('CREATE SCHEMA "auth"');
    DB::statement('CREATE TABLE auth.users (id uuid NOT NULL PRIMARY KEY)');

    // 2. Load Main.Schema.txt
    $path = base_path('../Main.Schema.txt');
    if (!file_exists($path)) {
        $path = base_path('Main.Schema.txt');
    }
    if (!file_exists($path)) {
        $this->error("Main.Schema.txt not found");
        return;
    }

    $sql = file_get_contents($path);

    // Remove single-line SQL comments
    $sql = preg_replace('/--.*$/m', '', $sql);

    // Replace unquoted Main.TableName with quoted "Main"."TableName" to preserve case-sensitivity
    $sql = preg_replace('/(?<!")\bMain\.([A-Za-z0-9_]+)/i', '"Main"."$1"', $sql);

    // Replace invalid USER-DEFINED placeholder with text type
    $sql = str_replace('USER-DEFINED', 'text', $sql);

    // 3. Dynamically find and create all missing sequence definitions
    if (preg_match_all('/\'"Main"\."?([A-Za-z0-9_]+)"?\'/i', $sql, $seqMatches)) {
        $uniqueSequences = array_unique($seqMatches[1]);
        foreach ($uniqueSequences as $seqName) {
            DB::statement("CREATE SEQUENCE IF NOT EXISTS \"Main\".\"{$seqName}\";");
        }
    }

    // 4. Split by ");" to get individual CREATE TABLE statements
    $statements = preg_split('/\);\s*/', $sql);
    $foreignKeys = [];

    foreach ($statements as $stmt) {
        $stmt = trim($stmt);
        if (empty($stmt)) continue;

        if (preg_match('/^CREATE TABLE\s+([A-Za-z0-9\._"]+)\s*\((.*)$/is', $stmt, $matches)) {
            $tableName = $matches[1];
            $body = $matches[2];

            $lines = explode("\n", $body);
            $newLines = [];

            foreach ($lines as $line) {
                $trimmedLine = trim($line);
                if (empty($trimmedLine)) continue;

                // Quote column names to preserve exact casing for PostgreSQL
                if (!preg_match('/^\s*(CONSTRAINT|PRIMARY|FOREIGN|UNIQUE|CHECK)\b/i', $trimmedLine)) {
                    $line = preg_replace('/^\s*([A-Za-z0-9_]+)\b/i', '"$1"', $line);
                    $trimmedLine = preg_replace('/^\s*([A-Za-z0-9_]+)\b/i', '"$1"', $trimmedLine);
                }

                // Match foreign key constraints
                if (preg_match('/CONSTRAINT\s+([A-Za-z0-9_]+)\s+FOREIGN KEY/i', $trimmedLine) || preg_match('/FOREIGN KEY\s*\(/i', $trimmedLine)) {
                    // Quote the local columns inside FOREIGN KEY(...)
                    $trimmedLine = preg_replace('/FOREIGN KEY\s*\(\s*([A-Za-z0-9_]+)\s*\)/i', 'FOREIGN KEY ("$1")', $trimmedLine);
                    // Quote the referenced columns inside REFERENCES table(...)
                    $trimmedLine = preg_replace('/REFERENCES\s+([A-Za-z0-9_"\.]+)\s*\(\s*([A-Za-z0-9_]+)\s*\)/i', 'REFERENCES $1 ("$2")', $trimmedLine);

                    $cleanConstraint = rtrim($trimmedLine, ',');
                    $foreignKeys[] = [
                        'table' => $tableName,
                        'constraint' => $cleanConstraint
                    ];
                } else {
                    $newLines[] = $line;
                }
            }

            // Reconstruct the CREATE TABLE body, removing trailing commas
            $newBody = implode("\n", $newLines);
            $newBody = preg_replace('/,\s*$/s', '', $newBody);

            $createSql = "CREATE TABLE IF NOT EXISTS {$tableName} (\n{$newBody}\n);";
            DB::statement($createSql);
        } else {
            DB::statement($stmt . ';');
        }
    }

    // 5. Apply all foreign key constraints
    foreach ($foreignKeys as $fk) {
        $alterSql = "ALTER TABLE {$fk['table']} ADD {$fk['constraint']};";
        DB::statement($alterSql);
    }

    // 6. Ensure migrations table exists
    if (!Schema::hasTable('Main.migrations')) {
        DB::statement('CREATE TABLE IF NOT EXISTS "Main".migrations (
            id serial PRIMARY KEY,
            migration varchar(255) NOT NULL,
            batch integer NOT NULL
        )');
    }

    // 7. Seed migrations table with all files
    $migrationFiles = glob(database_path('migrations/*.php'));
    $batch = 1;

    foreach ($migrationFiles as $file) {
        $name = basename($file, '.php');
        DB::table('Main.migrations')->insertOrIgnore([
            'migration' => $name,
            'batch' => $batch
        ]);
    }

    $this->info('Database schema loaded and migrations seeded successfully!');
})->purpose('Load database schema from Main.Schema.txt and seed migrations table');


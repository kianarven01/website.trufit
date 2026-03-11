<?php

namespace App\Domains\Audit\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class AuditLogResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'actor' => [
                'id' => $this->employee_id,
                'name' => $this->actor->name ?? 'System',
            ],
            'event_type' => $this->event_type,
            'action' => $this->action,
            'target' => [
                'type' => $this->auditable_type,
                'id' => $this->auditable_id,
            ],
            'changes' => [
                'before' => $this->old_values,
                'after' => $this->new_values,
            ],
            'metadata' => [
                'ip' => $this->ip_address,
                'user_agent' => $this->user_agent,
            ],
            'created_at' => $this->created_at->format('Y-m-d H:i:s'),
            'time_ago' => $this->created_at->diffForHumans(),
        ];
    }
}
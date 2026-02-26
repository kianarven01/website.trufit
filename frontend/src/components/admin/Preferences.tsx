import RoleManager from "@/components/admin/RoleManager";

const Preferences = () => (
  <div className="p-10">
    <header className="mb-10">
      <h1 className="text-4xl font-extrabold text-slate-800">
        System Preferences
      </h1>
      <p className="text-slate-500 mt-2 text-lg">
        Define organizational roles and granular module permissions.
      </p>
    </header>
    <div className="max-w-4xl">
      <RoleManager />
    </div>
  </div>
);

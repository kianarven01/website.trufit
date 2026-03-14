import KeyGenerator from "../../components/admin/KeyGenerator";

const Recruitment = () => (
  <div className="p-10">
    <header className="mb-10">
      <h1 className="text-4xl font-extrabold text-slate-800">
        Recruitment Portal
      </h1>
      <p className="text-slate-500 mt-2 text-lg">
        Generate onboarding keys for new employees.
      </p>
    </header>
    <div className="max-w-2xl bg-white p-8 rounded-2xl shadow-sm border-t-8 border-red-600">
      <h3 className="text-slate-400 text-xs font-black uppercase tracking-widest mb-6">
        Create Access Key
      </h3>
      <KeyGenerator />
    </div>
  </div>
);

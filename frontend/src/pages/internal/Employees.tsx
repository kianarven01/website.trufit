import React, { useState } from "react";

type EmployeeStatus = "Active" | "Inactive";

interface Employee {
  id: string;
  name: string;
  email: string;
  role: string;
  employmentType: string;
  status: EmployeeStatus;
  teams: string[];
}

const mockEmployees: Employee[] = [
  {
    id: "#23454GH6J7YT6",
    name: "Tanner Finsha",
    email: "tannerfisher@gmail.com",
    role: "Product Designer",
    employmentType: "Full time",
    status: "Active",
    teams: ["Marketing", "Design"],
  },
  {
    id: "#23454GH6J7YT6",
    name: "Emeto Winner",
    email: "emetowinner@gmail.com",
    role: "Product Designer",
    employmentType: "Contract",
    status: "Active",
    teams: ["Product", "Design"],
  },
  {
    id: "#23454GH6J7YT6",
    name: "Tassy Omah",
    email: "tassyomah@gmail.com",
    role: "Product Designer",
    employmentType: "Associate",
    status: "Inactive",
    teams: ["Product"],
  },
  {
    id: "#23454GH6J7YT6",
    name: "James Muriel",
    email: "jamesmuriel@aerten.finance",
    role: "Backend Engineer",
    employmentType: "Part time",
    status: "Active",
    teams: ["Engineering", "Design"],
  },
];

const Employees: React.FC = () => {
  const [search, setSearch] = useState("");

  const filteredEmployees = mockEmployees.filter((emp) =>
    `${emp.name} ${emp.email} ${emp.role}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="p-10 bg-gray-100 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800">
            Employees
          </h1>
          <p className="text-slate-500 mt-1">
            Manage staff, roles, and teams
          </p>
        </div>

        <div className="flex gap-3">
          <button className="px-4 py-2 border rounded-lg text-slate-600 hover:bg-slate-100">
            Export
          </button>
          <button className="px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
            + New Employee
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 border-b mb-6">
        <button className="pb-3 border-b-2 border-red-600 font-semibold text-red-600">
          All Employees
        </button>
        <button className="pb-3 text-slate-400 hover:text-slate-600">
          Teams
        </button>
        <button className="pb-3 text-slate-400 hover:text-slate-600">
          Roles
        </button>
      </div>

      {/* Search & Filters */}
      <div className="flex justify-between items-center mb-6">
        <input
          type="text"
          placeholder="Search employee by name, role, ID or keyword"
          className="w-1/2 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <button className="px-4 py-2 border rounded-lg text-slate-600 hover:bg-slate-100">
          Filter
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 uppercase text-xs">
            <tr>
              <th className="p-4 text-left">Name</th>
              <th className="p-4 text-left">Employee ID</th>
              <th className="p-4 text-left">Role</th>
              <th className="p-4 text-left">Status</th>
              <th className="p-4 text-left">Teams</th>
              <th className="p-4"></th>
            </tr>
          </thead>

          <tbody>
            {filteredEmployees.map((emp, idx) => (
              <tr
                key={idx}
                className="border-t hover:bg-slate-50 transition"
              >
                <td className="p-4">
                  <p className="font-semibold text-slate-800">
                    {emp.name}
                  </p>
                  <p className="text-slate-400">{emp.email}</p>
                </td>

                <td className="p-4 text-slate-600">{emp.id}</td>

                <td className="p-4">
                  <p className="font-medium text-slate-700">
                    {emp.role}
                  </p>
                  <p className="text-xs text-slate-400">
                    {emp.employmentType}
                  </p>
                </td>

                <td className="p-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      emp.status === "Active"
                        ? "bg-green-100 text-green-600"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {emp.status}
                  </span>
                </td>

                <td className="p-4 flex gap-2 flex-wrap">
                  {emp.teams.map((team, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 rounded-full text-xs bg-slate-100 text-slate-600"
                    >
                      {team}
                    </span>
                  ))}
                </td>

                <td className="p-4 text-right">
                  <button className="text-slate-400 hover:text-slate-600">
                    ⋮
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-6">
        <button className="px-4 py-2 border rounded-lg text-slate-600 hover:bg-slate-100">
          ← Previous
        </button>

        <div className="flex gap-2">
          <button className="w-9 h-9 rounded-lg bg-slate-200 font-semibold">
            1
          </button>
          <button className="w-9 h-9 rounded-lg hover:bg-slate-100">
            2
          </button>
          <button className="w-9 h-9 rounded-lg hover:bg-slate-100">
            3
          </button>
          <span className="px-2">...</span>
          <button className="w-9 h-9 rounded-lg hover:bg-slate-100">
            10
          </button>
        </div>

        <button className="px-4 py-2 border rounded-lg text-slate-600 hover:bg-slate-100">
          Next →
        </button>
      </div>
    </div>
  );
};

export default Employees;
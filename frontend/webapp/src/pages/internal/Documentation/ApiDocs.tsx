import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scrollArea";
import {
  FileCode,
  Copy,
  Check,
  ChevronDown,
  ChevronRight,
  Lock,
  Unlock,
  RefreshCw,
} from "lucide-react";

interface Endpoint {
  method: string;
  path: string;
  description: string;
  auth: boolean;
  permissions?: string[];
  parameters?: { name: string; type: string; required: boolean; description: string }[];
  response?: string;
}

const apiEndpoints: { group: string; endpoints: Endpoint[] }[] = [
  {
    group: "Authentication",
    endpoints: [
      {
        method: "POST",
        path: "/api/auth/login",
        description: "Authenticate user and return access token",
        auth: false,
        parameters: [
          { name: "username", type: "string", required: true, description: "User's username" },
          { name: "password", type: "string", required: true, description: "User's password" },
        ],
        response: "{ status: 'success', data: { user, token, role } }",
      },
      {
        method: "GET",
        path: "/api/auth/verify",
        description: "Verify current session and return user data",
        auth: true,
        response: "{ status: 'success', data: { user } }",
      },
    ],
  },
  {
    group: "Customers",
    endpoints: [
      {
        method: "GET",
        path: "/api/customers",
        description: "List all customers",
        auth: true,
        permissions: ["customers.view"],
      },
      {
        method: "POST",
        path: "/api/customers",
        description: "Create a new customer",
        auth: true,
        permissions: ["customers.manage"],
      },
      {
        method: "GET",
        path: "/api/customers/:id",
        description: "Get customer by ID",
        auth: true,
        permissions: ["customers.view"],
      },
      {
        method: "PUT",
        path: "/api/customers/:id",
        description: "Update customer",
        auth: true,
        permissions: ["customers.manage"],
      },
    ],
  },
  {
    group: "Appointments",
    endpoints: [
      {
        method: "GET",
        path: "/api/appointments",
        description: "List all appointments",
        auth: true,
        permissions: ["appointments.view"],
      },
      {
        method: "POST",
        path: "/api/appointments",
        description: "Create a new appointment",
        auth: true,
        permissions: ["appointments.manage"],
      },
      {
        method: "PUT",
        path: "/api/appointments/:id",
        description: "Update appointment",
        auth: true,
        permissions: ["appointments.manage"],
      },
    ],
  },
  {
    group: "Job Orders",
    endpoints: [
      {
        method: "GET",
        path: "/api/job-orders",
        description: "List all job orders",
        auth: true,
        permissions: ["services.view_job_orders"],
      },
      {
        method: "POST",
        path: "/api/job-orders",
        description: "Create a new job order",
        auth: true,
        permissions: ["services.manage_job_orders"],
      },
    ],
  },
  {
    group: "Sales & Estimates",
    endpoints: [
      {
        method: "GET",
        path: "/api/estimates",
        description: "List all estimates",
        auth: true,
        permissions: ["sales.view"],
      },
      {
        method: "POST",
        path: "/api/estimates",
        description: "Create a new estimate",
        auth: true,
        permissions: ["sales.manage"],
      },
      {
        method: "GET",
        path: "/api/sales-orders",
        description: "List all sales orders",
        auth: true,
        permissions: ["sales.view"],
      },
    ],
  },
  {
    group: "Admin & Roles",
    endpoints: [
      {
        method: "GET",
        path: "/api/admin/roles",
        description: "List all system roles",
        auth: true,
        permissions: ["system.manage_roles"],
      },
      {
        method: "POST",
        path: "/api/admin/roles",
        description: "Create a new role",
        auth: true,
        permissions: ["system.manage_roles"],
      },
      {
        method: "PUT",
        path: "/api/admin/roles/:id",
        description: "Update a role",
        auth: true,
        permissions: ["system.manage_roles"],
      },
      {
        method: "DELETE",
        path: "/api/admin/roles/:id",
        description: "Delete a role",
        auth: true,
        permissions: ["system.manage_roles"],
      },
      {
        method: "GET",
        path: "/api/admin/employees",
        description: "List all employees",
        auth: true,
        permissions: ["system.manage_employees"],
      },
    ],
  },
];

const methodColors: Record<string, string> = {
  GET: "bg-green-500",
  POST: "bg-blue-500",
  PUT: "bg-yellow-500",
  DELETE: "bg-red-500",
};

const ApiDocs: React.FC = () => {
  const [expandedGroups, setExpandedGroups] = useState<string[]>(["Authentication"]);
  const [copiedPath, setCopiedPath] = useState<string | null>(null);

  const toggleGroup = (group: string) => {
    setExpandedGroups((prev) =>
      prev.includes(group) ? prev.filter((g) => g !== group) : [...prev, group]
    );
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPath(text);
    setTimeout(() => setCopiedPath(null), 2000);
  };

  return (
    <div className="w-full h-full overflow-y-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <FileCode className="h-6 w-6 text-primary" />
            API Documentation
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            RESTful API reference for TruFit Auto Center
          </p>
        </div>
        <Badge variant="outline" className="text-xs">
          v1.0
        </Badge>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-green-500" />
              <span>GET</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-blue-500" />
              <span>POST</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-yellow-500" />
              <span>PUT</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-red-500" />
              <span>DELETE</span>
            </div>
            <div className="ml-auto flex items-center gap-2 text-muted-foreground">
              <Lock className="h-3 w-3" />
              <span>Requires Authentication</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {apiEndpoints.map((group) => {
          const isExpanded = expandedGroups.includes(group.group);
          return (
            <Card key={group.group}>
              <button
                onClick={() => toggleGroup(group.group)}
                className="w-full flex items-center justify-between p-4 hover:bg-accent/5 transition-colors"
              >
                <div className="flex items-center gap-2">
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="font-semibold">{group.group}</span>
                  <Badge variant="secondary" className="text-xs">
                    {group.endpoints.length}
                  </Badge>
                </div>
              </button>
              {isExpanded && (
                <div className="border-t divide-y">
                  {group.endpoints.map((endpoint, idx) => (
                    <div key={idx} className="p-4 hover:bg-accent/5">
                      <div className="flex items-center gap-3 mb-2">
                        <span
                          className={`${methodColors[endpoint.method]} text-white text-xs font-bold px-2 py-0.5 rounded`}
                        >
                          {endpoint.method}
                        </span>
                        <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                          {endpoint.path}
                        </code>
                        <button
                          onClick={() => copyToClipboard(endpoint.path)}
                          className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {copiedPath === endpoint.path ? (
                            <Check className="h-3 w-3 text-green-500" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </button>
                        {endpoint.auth && (
                          <Lock className="h-3 w-3 text-muted-foreground" />
                        )}
                        {!endpoint.auth && (
                          <Unlock className="h-3 w-3 text-green-500" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{endpoint.description}</p>
                      {endpoint.permissions && endpoint.permissions.length > 0 && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">Requires:</span>
                          {endpoint.permissions.map((p) => (
                            <Badge key={p} variant="outline" className="text-[10px]">
                              {p}
                            </Badge>
                          ))}
                        </div>
                      )}
                      {endpoint.parameters && endpoint.parameters.length > 0 && (
                        <div className="mt-3 space-y-1">
                          <span className="text-xs font-medium text-muted-foreground">Parameters:</span>
                          {endpoint.parameters.map((param) => (
                            <div key={param.name} className="flex items-center gap-2 text-xs ml-2">
                              <code className="bg-muted px-1 rounded">{param.name}</code>
                              <span className="text-muted-foreground">({param.type})</span>
                              {param.required && (
                                <Badge variant="destructive" className="text-[10px]">required</Badge>
                              )}
                              <span className="text-muted-foreground">- {param.description}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      {endpoint.response && (
                        <div className="mt-3">
                          <span className="text-xs font-medium text-muted-foreground">Response:</span>
                          <pre className="mt-1 text-xs bg-muted p-2 rounded overflow-x-auto">
                            {endpoint.response}
                          </pre>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default ApiDocs;

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from "@/components/ui/breadcrumb";
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import DataToolbar from "@/components/DataToolbar";
import { Pagination, usePagination } from "@/components/ui/pagination";
import CustomerFormModal from "@/components/popupModal/Customers/addCustomer";
import AddCustomerVehicle from "@/components/popupModal/Customers/addCustomerVehicle";
import { ScrollArea, ScrollBar } from "@/components/ui/scrollArea";
import { ArrowLeft, Edit, Mail, Phone, MapPin, Car, ClipboardClock } from "lucide-react";

const STORAGE_KEY = "customers";

/* TYPES */
interface Vehicle {
  id: string;
  year: number;
  make: string;
  model: string;
  variant: string;
  color: string;
  plateNo: string;
  engineNo: string;
  vin: string;
  registrationNo: string;
  sellingDealer: string;
  hasWarranty?: boolean;
}

interface Customer {
  id: string;
  name: string;
  email: string;
  address: string;
  mobileNumber: string;
  landline?: string;
  businessPhone?: string;
  vehicles?: Vehicle[];
  interviews?: InterviewSheet[];
}

interface InterviewSheet {
  id: string;
  date: string;
  time: string;
  transactionRecord: string;
  status: "Completed" | "Pending" | "Cancelled";
}

const CustomerDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [hoveredVehicleId, setHoveredVehicleId] = useState<string | null>(null);
  const [openAddVehicle, setOpenAddVehicle] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const { page, setPage, pageSize, setPageSize, paginate } = usePagination(25);

  const [customerData, setCustomerData] = useState<Customer | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [hasInitializedSelection, setHasInitializedSelection] = useState(false);

  // Load customer from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const customers: Customer[] = JSON.parse(stored);
        const found = customers.find((c) => c.id === id);
        if (found) setCustomerData(found);
      }
    } catch (err) {
      console.error("Failed to load customer", err);
    }
  }, [id]);

  useEffect(() => {
    if (!customerData || hasInitializedSelection) return;

    const vehicles = customerData.vehicles || [];
    const hasMultipleVehicles = vehicles.length > 1;

    setSelectedVehicle(hasMultipleVehicles ? null : vehicles[0] || null);

    setHasInitializedSelection(true);
  }, [customerData, hasInitializedSelection]);

  // Save customer updates to localStorage
  const saveCustomerToStorage = (updated: Customer) => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const customers: Customer[] = stored ? JSON.parse(stored) : [];
      const updatedCustomers = customers.map((c) => (c.id === updated.id ? updated : c));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedCustomers));
    } catch (err) {
      console.error("Failed to save customer", err);
    }
  };

  const handleSaveCustomer = (updated: any) => {
    setCustomerData(updated);
    saveCustomerToStorage(updated);

    if (updated.__lastAddedVehicle) {
      setSelectedVehicle(updated.__lastAddedVehicle);
    }
  };

  if (!customerData) {
    return (
      <Card>
        <CardContent className="py-16 flex flex-col items-center text-center">
          <ClipboardClock className="h-6 w-6 mb-2 text-muted-foreground" />
          <p className="text-sm font-medium">Customer not found</p>
        </CardContent>
      </Card>
    );
  }

  const vehicles = customerData.vehicles || [];
  const hasMultipleVehicles = vehicles.length > 1;

  const interviews: InterviewSheet[] = customerData.interviews || [];
  const paginatedInterviews = paginate(interviews);


  return (
    <div className="w-full h-full px-4 py-2 flex flex-col gap-4 overflow-y-auto">
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink onClick={() => navigate("/webapp/customers")}>Customers</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{customerData.id}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <DataToolbar
        variant="detail"
        title="Customer Profile"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>
            <Button size="sm" onClick={() => setOpenEdit(true)}>
              <Edit className="w-4 h-4 mr-2" /> Edit Profile
            </Button>
          </div>
        }
      />

      {/* Main content */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          {/* CUSTOMER */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Customer Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Full Name</p>
                <p className="text-sm">{customerData.name}</p>
              </div>

              <div className="space-y-2">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Email</p>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5" />
                  <p className="text-sm">{customerData.email}</p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Mobile</p>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5" />
                  <p className="text-sm">{customerData.mobileNumber}</p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Landline</p>
                <p className="text-sm">{customerData.landline || "—"}</p>
              </div>

              <div className="space-y-2">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Address</p>
                <div className="flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 mt-1" />
                  <p className="text-sm break-words">{customerData.address}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* VEHICLE */}
          <Card className="xl:col-span-2 flex flex-col h-full">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Car className="w-5 h-5 text-primary" />
                {selectedVehicle ? (
                  <div className="flex items-center gap-2">
                    <span>{`${selectedVehicle.year} ${selectedVehicle.make} ${selectedVehicle.model}`}</span>
                    {selectedVehicle.hasWarranty && <Badge variant="secondary">Warranty</Badge>}
                  </div>
                ) : (
                  "Vehicle List"
                )}
              </CardTitle>

              {selectedVehicle && hasMultipleVehicles && (
                <Button size="xs" variant="outline" onClick={() => setSelectedVehicle(null)}>Vehicle List</Button>
              )}
            </CardHeader>

            <CardContent className="flex-1 flex flex-col overflow-hidden">
              {vehicles.length === 0 ? (
                <p className="text-sm text-muted-foreground">No vehicle</p>
              ) : !selectedVehicle ? (
                <ScrollArea className="w-full flex-1 pb-2">
                  <div className="grid grid-flow-col auto-cols-[calc(75%-1rem)] lg:auto-cols-[calc(33.333%-1rem)] gap-4 min-w-full pt-3 px-1">
                    {vehicles.map((v) => {
                      const isHovered = hoveredVehicleId === v.id;
                      const isAnyHovered = hoveredVehicleId !== null;

                      return (
                        <Card
                          key={v.id}
                          onClick={() => setSelectedVehicle(v)}
                          onMouseEnter={() => setHoveredVehicleId(v.id)}
                          onMouseLeave={() => setHoveredVehicleId(null)}
                          className={`
                            cursor-pointer lg:h-[18rem] flex flex-col transition-all duration-300 ease-in-out
                            ${isHovered 
                              ? 'bg-white shadow-2xl shadow-blue-200/50 -translate-y-2 ring-1 ring-blue-500 ring-offset-2 z-10' 
                              : isAnyHovered 
                                ? 'opacity-40 blur-[1px] scale-[0.98]' 
                                : 'hover:shadow-md'}
                          `}
                        >
                          <CardContent className="p-4 flex flex-col flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <h3 className={`text-sm font-semibold leading-tight transition-colors duration-300 ${isHovered ? 'text-blue-600' : ''}`}>
                                {v.year} {v.make} {v.model}
                              </h3>
                              {v.hasWarranty && (
                                <Badge variant={isHovered ? "default" : "secondary"} className="transition-all duration-300">Warranty</Badge>
                              )}
                            </div>
                            <hr className={`my-2 transition-opacity ${isHovered ? 'opacity-100' : 'opacity-50'}`} />
                            <div className="space-y-3 text-sm flex-1">
                              {[
                                { label: "Variant", value: v.variant },
                                { label: "Color", value: v.color },
                                { label: "Plate Number", value: v.plateNo },
                              ].map((item) => (
                                <div key={item.label}>
                                  <p className="text-[10px] uppercase text-muted-foreground font-medium tracking-tight">{item.label}</p>
                                  <p className={`transition-colors ${isHovered ? 'text-slate-900' : 'text-slate-700'}`}>{item.value}</p>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}

                    {/* ADD VEHICLE CARD */}
                    <Card
                      onClick={() => setOpenAddVehicle(true)}
                      onMouseEnter={() => setHoveredVehicleId('add-vehicle')}
                      onMouseLeave={() => setHoveredVehicleId(null)}
                      className={`
                        cursor-pointer lg:h-[18rem] flex flex-col items-center justify-center text-center border-dashed border-2 transition-all duration-300
                        ${hoveredVehicleId === 'add-vehicle' 
                          ? 'bg-blue-50 border-blue-500 border-solid shadow-xl -translate-y-2 ring-2 ring-blue-500/20' 
                          : hoveredVehicleId 
                            ? 'opacity-40 blur-[1px]' 
                            : 'border-muted hover:border-blue-400'}
                      `}
                    >
                      <CardContent className="flex flex-col items-center justify-center gap-2">
                        <Car className={`w-12 h-12 stroke-1 transition-all duration-300 ${hoveredVehicleId === 'add-vehicle' ? 'scale-110 text-blue-600' : 'text-muted-foreground'}`} />
                        <p className={`transition-colors font-medium ${hoveredVehicleId === 'add-vehicle' ? 'text-blue-600' : 'text-muted-foreground'}`}>
                          + Add New Vehicle
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                  <ScrollBar orientation="horizontal" />
                </ScrollArea>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {[
                    ["Variant", selectedVehicle.variant],
                    ["Color", selectedVehicle.color],
                    ["Plate Number", selectedVehicle.plateNo],
                    ["Engine Number", selectedVehicle.engineNo],
                    ["VIN", selectedVehicle.vin],
                    ["Registration No.", selectedVehicle.registrationNo],
                    ["Selling Dealer", selectedVehicle.sellingDealer],
                  ].map(([label, value]) => (
                    <div key={label} className="space-y-2">
                      <p className="text-xs uppercase text-muted-foreground">{label}</p>
                      <p className="text-sm">{value}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {interviews.length > 0 ? (
          /* Customer History */
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle className="text-lg">Customer History</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col flex-1 overflow-hidden p-0">
              <ScrollArea className="flex-1">
                <div className="border rounded-lg m-4 overflow-hidden">
                  <Table className="table-fixed w-full">
                    <TableHeader className="bg-muted/50 sticky top-0 z-10">
                      <TableRow>
                        <TableHead className="w-[5%]">No.</TableHead>
                        <TableHead>Interview ID</TableHead>
                        <TableHead>Date & Time</TableHead>
                        <TableHead>Transaction</TableHead>
                        <TableHead className="w-[15%]">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedInterviews.map((item, index) => (
                        <TableRow key={item.id}>
                          <TableCell>{(page - 1) * pageSize + index + 1}</TableCell>
                          <TableCell className="font-semibold text-primary">{item.id}</TableCell>
                          <TableCell>{item.date} @ {item.time}</TableCell>
                          <TableCell>{item.transactionRecord}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                item.status === "Completed" ? "default" :
                                item.status === "Pending" ? "secondary" : "destructive"
                              }
                            >
                              {item.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </ScrollArea>
              {interviews.length > 25 && (
                <div className="border-t px-4 py-2 bg-background">
                  <Pagination
                    totalItems={interviews.length}
                    page={page}
                    pageSize={pageSize}
                    onPageChange={setPage}
                    onPageSizeChange={setPageSize}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle className="text-lg">Customer History</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col items-center justify-center text-center pb-8">
              <ClipboardClock className="h-10 w-10 stroke-1 mb-2 text-muted-foreground" />
              <p className="text-sm font-light tracking-wide text-muted-foreground">
                There is no history available for this customer.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* MODALS */}
      <CustomerFormModal
        open={openEdit}
        onOpenChange={setOpenEdit}
        customer={customerData}
        onSaved={handleSaveCustomer}
      />

      <AddCustomerVehicle
        open={openAddVehicle}
        onOpenChange={setOpenAddVehicle}
        onSaved={(newVehicles) => { const updatedVehicles = [ ...(customerData.vehicles || []), ...newVehicles, ];

          const updatedCustomer = { ...customerData, vehicles: updatedVehicles, };

          setCustomerData(updatedCustomer);
          saveCustomerToStorage(updatedCustomer);

          if (newVehicles.length > 0) {
            setSelectedVehicle(newVehicles[newVehicles.length - 1]);
          }
        }}
      />
    </div>
  );
};

export default CustomerDetail;
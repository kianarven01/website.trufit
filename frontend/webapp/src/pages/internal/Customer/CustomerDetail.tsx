import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import DataToolbar from "@/components/DataToolbar";
import CustomerFormModal from "@/components/popupModal/addCustomer";

import { ArrowLeft, Edit, Mail, Phone, MapPin, Car, ClipboardClock } from "lucide-react";

/* TYPES */
interface Vehicle {
  id: string;
  yearMakeModel: string;
  variant: string;
  color: string;
  plateNo: string;
  engineNo: string;
  vin: string;
  registrationNo: string;
  sellingDealer: string;
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
}

interface InterviewSheet {
  id: string;
  date: string;
  time: string;
  transactionRecord: string;
  status: "Completed" | "Pending" | "Cancelled";
}

const CustomerDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  /* MODAL STATE */
  const [openEdit, setOpenEdit] = useState(false);

  /* DATA STATE */
  const [customerData, setCustomerData] = useState<Customer>({
    id: id || "CUST-9901",
    name: "Juan Dela Cruz",
    email: "juan.delacruz@email.com",
    address: "123 Mahogany St., Brgy. San Lorenzo, Quezon City, 1100",
    mobileNumber: "+63 912 345 6789",
    landline: "(02) 8123-4567",
    vehicles: [
      {
        id: "veh-1",
        yearMakeModel: "2024 Toyota Fortuner",
        variant: "2.8L Q AT 4x2",
        color: "Attitude Black Mica",
        plateNo: "NBO 1234",
        engineNo: "1GD-FTV-123456",
        vin: "MHF12345678901234",
        registrationNo: "ORCR-987654321",
        sellingDealer: "Toyota Quezon Avenue",
      },
    ],
  });

  const interviews: InterviewSheet[] = [

  ];

  /* HANDLER */
  const handleSaveCustomer = (updated: Customer) => {
    setCustomerData(updated);
  };

  const vehicle = customerData.vehicles?.[0];


  /* FIELD COMPONENT */
  const Field = ({
    label,
    value,
    icon,
    multiline,
  }: {
    label: string;
    value?: any;
    icon?: React.ReactNode;
    multiline?: boolean;
  }) => (
    <div className="space-y-2">
      <p className="text-xs uppercase tracking-wider text-muted-foreground">
        {label}
      </p>

      <div className="flex items-start gap-2">
        {icon}
        <p className={`text-sm ${multiline ? "break-words" : ""}`}>
          {value || "—"}
        </p>
      </div>
    </div>
  );

  return (
    <div className="w-full h-full px-4 py-2 flex flex-col gap-4 overflow-y-auto">
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink onClick={() => navigate("/webapp/customers")}>
              Customers
            </BreadcrumbLink>
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
        title={customerData.name}
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

      {/* CONTENT */}
      <div className="space-y-4">
        {/* TOP GRID */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          {/* CUSTOMER */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Customer Profile</CardTitle>
            </CardHeader>

            <CardContent className="space-y-5">
              <Field label="Full Name" value={customerData.name} />
              <Field icon={<Mail className="w-3.5 h-3.5" />} label="Email" value={customerData.email} />
              <Field icon={<Phone className="w-3.5 h-3.5" />} label="Mobile" value={customerData.mobileNumber} />
              <Field label="Landline" value={customerData.landline} />
              <Field icon={<MapPin className="w-3.5 h-3.5 mt-1" />} label="Address" value={customerData.address} multiline />
            </CardContent>
          </Card>

          {/* VEHICLE */}
          <Card className="xl:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Car className="w-5 h-5 text-primary" />
                Primary Vehicle
              </CardTitle>

              <Badge variant="secondary">
                Active Warranty
              </Badge>
            </CardHeader>

            <CardContent>
              {vehicle ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    ["Year / Make / Model", vehicle.yearMakeModel],
                    ["Variant", vehicle.variant],
                    ["Color", vehicle.color],
                    ["Plate Number", vehicle.plateNo],
                    ["Engine Number", vehicle.engineNo],
                    ["VIN", vehicle.vin],
                    ["Registration No.", vehicle.registrationNo],
                    ["Selling Dealer", vehicle.sellingDealer],
                  ].map(([label, value]) => (
                    <Field key={label} label={label} value={value} />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No vehicle</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* HISTORY */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Customer History</CardTitle>
          </CardHeader>

          <CardContent>
            {interviews.length > 0 ? (
              <div className="border rounded-lg overflow-hidden">
                <Table className="table-fixed w-full">
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead>No.</TableHead>
                      <TableHead>Interview ID</TableHead>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Transaction</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {interviews.map((item, index) => (
                      <TableRow key={item.id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell className="font-semibold text-primary">
                          {item.id}
                        </TableCell>
                        <TableCell>
                          {item.date} @ {item.time}
                        </TableCell>
                        <TableCell>{item.transactionRecord}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              item.status === "Completed"
                                ? "default"
                                : item.status === "Pending"
                                ? "secondary"
                                : "destructive"
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
            ) : (
              <div className="py-2 flex flex-col items-center text-center">
                <ClipboardClock className="h-10 w-10 stroke-1 mb-2 text-muted-foreground" />
                <p className="text-sm font-light tracking-wide text-muted-foreground">
                  No customer history available.
                </p>
              </div>            
            )}
          </CardContent>
        </Card>
      </div>

      {/* MODAL */}
      <CustomerFormModal
        open={openEdit}
        onOpenChange={setOpenEdit}
        customer={customerData}
        onSaved={handleSaveCustomer}
      />
    </div>
  );
};



export default CustomerDetail;
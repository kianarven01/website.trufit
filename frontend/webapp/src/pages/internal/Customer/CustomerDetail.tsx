import React from "react";
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
import { ArrowLeft, Edit, Mail, Phone, MapPin, Car } from "lucide-react";

/* TYPES */
interface Customer {
  id: string;
  name: string;
  email: string;
  address: string;
  mobileNumber: string;
  landline?: string;
  businessPhone?: string;
}

interface Vehicle {
  yearMakeModel: string;
  variant: string;
  color: string;
  plateNo: string;
  engineNo: string;
  vin: string;
  registrationNo: string;
  sellingDealer: string;
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

  /* DUMMY DATA */
  const customer: Customer = {
    id: id || "CUST-9901",
    name: "Juan Dela Cruz",
    email: "juan.delacruz@email.com",
    address: "123 Mahogany St., Brgy. San Lorenzo, Quezon City, 1100",
    mobileNumber: "+63 912 345 6789",
    landline: "(02) 8123-4567",
  };

  const vehicle: Vehicle = {
    yearMakeModel: "2024 Toyota Fortuner",
    variant: "2.8L Q AT 4x2",
    color: "Attitude Black Mica",
    plateNo: "NBO 1234",
    engineNo: "1GD-FTV-123456",
    vin: "MHF12345678901234",
    registrationNo: "ORCR-987654321",
    sellingDealer: "Toyota Quezon Avenue",
  };

  const interviews: InterviewSheet[] = [
    {
      id: "INT-2026-001",
      date: "Mar 25, 2026",
      time: "10:00 AM",
      transactionRecord: "Job Order #JO-8821",
      status: "Completed",
    },
    {
      id: "INT-2026-002",
      date: "Mar 28, 2026",
      time: "02:30 PM",
      transactionRecord: "Inquiry #IQ-9902",
      status: "Pending",
    },
  ];

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
            <BreadcrumbPage>{customer.id}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <DataToolbar
        variant="detail"
        title={customer.name}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>
            <Button size="sm">
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
          <Card className="xl:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">Customer Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Full Name */}
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  Full Name
                </p>
                <p className="text-sm">
                  {customer.name || "—"}
                </p>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  Email
                </p>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-muted-foreground/70" />
                  <p className="text-sm">
                    {customer.email || "—"}
                  </p>
                </div>
              </div>

              {/* Mobile */}
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  Mobile
                </p>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-muted-foreground/70" />
                  <p className="text-sm">
                    {customer.mobileNumber || "—"}
                  </p>
                </div>
              </div>

              {/* Landline */}
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  Landline
                </p>
                <p className="text-sm">
                  {customer.landline || "—"}
                </p>
              </div>

              {/* Address */}
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  Address
                </p>
                <div className="flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 text-muted-foreground/70 mt-1" />
                  <p className="text-sm break-words">
                    {customer.address || "—"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* VEHICLE */}
          <Card className="xl:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Car className="w-5 h-5 text-primary" />
                Primary Vehicle
              </CardTitle>
              <Badge variant="secondary">Active Warranty</Badge>
            </CardHeader>

            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  ["Year / Make / Model", vehicle.yearMakeModel],
                  ["Variant", vehicle.variant],
                  ["Color", vehicle.color],
                  ["Plate Number", vehicle.plateNo],
                  ["Engine Number", vehicle.engineNo],
                  ["VIN / Chassis", vehicle.vin],
                  ["Registration No.", vehicle.registrationNo],
                  ["Selling Dealer", vehicle.sellingDealer],
                ].map(([label, value]) => (
                  <div key={label} className="space-y-2">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">
                      {label}
                    </p>
                    <p className="text-sm font-medium">
                      {value || "—"}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* TABLE */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Interview History</CardTitle>
          </CardHeader>

          <CardContent>
            <div className="border rounded-lg overflow-hidden">
              <Table className="table-fixed w-full">
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="w-1/12">No.</TableHead>
                    <TableHead>Interview ID</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Linked Transaction</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {interviews.map((item, index) => (
                    <TableRow key={item.id}>
                      <TableCell className="text-muted-foreground font-mono">
                        {(index + 1).toString().padStart(2, "0")}
                      </TableCell>
                      <TableCell className="font-semibold text-primary">
                        {item.id}
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{item.date}</span>
                        <span className="text-muted-foreground ml-2">
                          @ {item.time}
                        </span>
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CustomerDetail;
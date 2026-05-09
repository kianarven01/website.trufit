import React, { useEffect, useState, useRef, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import CurrencyInput from "@/components/ui/currencyInput";
import { Label } from "@/components/ui/label";
import Combobox from "@/components/ui/combobox";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import DataToolbar from "@/components/DataToolbar";
import AssignTaskModal from "@/components/popupModal/ServiceCatalog/AssignTasksModal";
import TaskLibraryModal from "@/components/popupModal/ServiceCatalog/TaskLibraryModal";
import ConfirmDialog from "@/components/popupModal/AlertDialog/ConfirmDialog";

import { ScrollArea } from "@/components/ui/scrollArea";
import { toast } from "sonner";
import { ArrowLeft, Plus, Save, MoreHorizontal, Clock, Tag, Pencil, Trash2, Check, X } from "lucide-react";

/* ================= STORAGE ================= */
const JOB_ORDER_KEY = "jobOrders";
const SALES_ORDER_KEY = "salesOrders";
const CUSTOMER_KEY = "customers";
const VEHICLE_KEY = "vehicles";
const VEHICLE_MODEL_KEY = "vehicleModels";
const CATEGORY_KEY = "serviceCategories";
const SERVICE_KEY = "services";
const SERVICE_TASK_KEY = "serviceTasks";
const TASK_LIBRARY_KEY = "taskLibrary";


/* ================= TYPES ================= */
interface Props {
  mode: "add" | "edit";
}
 
interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  address: string;
  mobileNumber: string;
  landline?: string;
  email?: string;
  businessPhone?: string;
}

interface VehicleModel {
  id: string;
  year: number;
  make: string;
  model: string;
  variant: string;
}

interface Vehicle {
  id: string;
  customerId: string;
  vehicleModelId: string;
  color: string;
  plateNo: string;
  engineNo: string;
  vin: string;
  registrationNo: string;
  sellingDealer: string;
  hasWarranty?: boolean;
}

interface JobOrder {
  id: string;
  customerId: string;
  vehicleId: string;
  salesOrderId?: string;
  technicianId?: string;
  dateTime: string;
  status: string;
}

interface JobOrderService {
  id: string;
  jobOrderId: string;
  serviceId: string;
  hours: number;
  price: number;  /*total price computed using pricing type and vehicle size price: if fixed then this will be same as price, if hourly rate then this will be hours * vehicle size price*/
}

interface ServiceCategory {
  id: string;
  name: string;
}

interface Service {
  id: string;
  name: string;
  serviceCategoryId: string;
  description?: string;
  pricingType: "fixed" | "hourly rate";
}

interface ServiceTask {
  id: string;
  serviceId: string;
  taskId: string;
}

interface TaskLibraryItem {
  id: string;
  name: string;
  description?: string;
}

interface SalesOrder {
  id: string;
  customerId: string;
  vehicleId: string;
  jobOrderId?: string;
  dateTime: string;
  status: string;
}

interface SalesOrderProduct{
  id: string;
  salesOrderId: string;
  productId: string;
  quantity: number;
  price: number; /* total price computed using selling price * quantity */
}

interface Product {
  id: string;
  name: string;
  partNumber: string;
  unit: string;
  selling_price: number;
  image?: string;
}

interface inventory {
  id: string;
  productId: string;
  quantity_on_hand: number;
}




const JobOrderForm: React.FC<Props> = ({ mode }) => {
  const navigate = useNavigate();
  const menuRef = useRef<HTMLDivElement | null>(null);
  const { id } = useParams();

  /* ================= STATE ================= */

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [vehicleModel, setVehicleModel] = useState<VehicleModel | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  const [jobOrder, setJobOrder] = useState<JobOrder | null>(null);
  const [salesOrder, setSalesOrder] = useState<SalesOrder | null>(null);
  const [jobOrderServices, setJobOrderServices] = useState<JobOrderService[]>([]);


  /* ================= UI ================= */

  return (
  <div>

  </div>

  );
};

export default JobOrderForm;
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { axiosInstance } from "@/lib/axios";

type SupplierItem = {
  id: string;
  name: string;
  serviceType: string;
  email: string;
  contactInfo: string;
};

export default function Supplier() {
  const [suppliers, setSuppliers] = useState<SupplierItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await axiosInstance.get("/suppliers");
        const data = res.data as unknown;
        const maybeItems = (data as Record<string, unknown>)?.data ?? data;
        const arr: unknown[] = Array.isArray(maybeItems)
          ? (maybeItems as unknown[])
          : [];
        setSuppliers(
          arr.map((s) => {
            const obj = (s ?? {}) as Record<string, unknown>;
            const pickString = (v: unknown): string =>
              typeof v === "string" ? v : "";
            const contactRaw = obj["contactInfo"] ?? obj["phone"];
            return {
              id: (obj.id ?? obj._id ?? "") as string,
              name: pickString(obj.name),
              serviceType: pickString(obj.serviceType),
              email: pickString(obj.email),
              contactInfo: pickString(contactRaw),
            };
          })
        );
      } catch {
        setError("Failed to load suppliers.");
      } finally {
        setLoading(false);
      }
    };
    fetchSuppliers();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Suppliers</h1>
        <Button variant="default">Add Supplier</Button>
      </div>
      <Card className="p-4">
        {error && <p className="text-sm text-red-500 mb-3">{error}</p>}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading && suppliers.length === 0 && (
            <div className="col-span-full text-center text-muted-foreground">
              Loading suppliers...
            </div>
          )}
          {suppliers.map((s) => (
            <Card key={s.id} className="p-4">
              <div className="text-lg font-semibold">{s.name}</div>
              <div className="text-gray-700">{s.serviceType}</div>
              <div className="text-gray-600 mt-2">{s.email}</div>
              <div className="text-gray-600">{s.contactInfo}</div>
              <div className="mt-3 flex gap-2">
                <Button size="sm" variant="secondary">
                  Edit
                </Button>
                <Button size="sm" variant="destructive">
                  Remove
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </Card>
    </div>
  );
}

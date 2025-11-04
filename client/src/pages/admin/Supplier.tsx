import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { mockSuppliers } from "@/components/MockData";

export default function Supplier() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Suppliers</h1>
        <Button variant="default">Add Supplier</Button>
      </div>
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mockSuppliers.map((s) => (
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

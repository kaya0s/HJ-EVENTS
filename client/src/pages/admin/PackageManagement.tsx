import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

type AdminPackage = {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
};

export default function PackageManagement() {
  const initial = useMemo<AdminPackage[]>(
    () => [
      {
        id: "basic",
        name: "Basic Package",
        price: 799,
        description: "Essential coordination for small events.",
        features: ["Event day coordination", "Vendor liaison", "Basic decor"],
      },
      {
        id: "standard",
        name: "Standard Package",
        price: 1999,
        description: "Planning support and enhanced experience.",
        features: [
          "Planning assistance",
          "Venue coordination",
          "Catering guidance",
        ],
      },
    ],
    []
  );
  const [packages, setPackages] = useState<AdminPackage[]>(initial);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [features, setFeatures] = useState("");

  const addPackage = (e: React.FormEvent) => {
    e.preventDefault();
    const id = name.trim().toLowerCase().replace(/\s+/g, "-");
    const newPkg: AdminPackage = {
      id,
      name: name.trim(),
      price: Number(price) || 0,
      description: description.trim(),
      features: features
        .split(",")
        .map((f) => f.trim())
        .filter(Boolean),
    };
    setPackages((prev) => [newPkg, ...prev]);
    setName("");
    setPrice("");
    setDescription("");
    setFeatures("");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Package Management</h1>
      </div>

      <Card className="p-6">
        <h2 className="text-xl font-medium mb-4">Add New Package</h2>
        <form
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
          onSubmit={addPackage}
        >
          <div>
            <Label htmlFor="pkg-name">Name</Label>
            <Input
              id="pkg-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="pkg-price">Price</Label>
            <Input
              id="pkg-price"
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="pkg-desc">Description</Label>
            <Input
              id="pkg-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="pkg-features">Features (comma-separated)</Label>
            <Input
              id="pkg-features"
              value={features}
              onChange={(e) => setFeatures(e.target.value)}
            />
          </div>
          <div className="md:col-span-2">
            <Button type="submit" className="w-full md:w-auto">
              Add Package
            </Button>
          </div>
        </form>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {packages.map((pkg) => (
          <Card key={pkg.id} className="p-6">
            <div className="mb-3">
              <h3 className="text-lg font-semibold">{pkg.name}</h3>
              <div className="text-2xl font-bold">${pkg.price}</div>
            </div>
            <p className="text-gray-600 mb-4">{pkg.description}</p>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              {pkg.features.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          </Card>
        ))}
      </div>
    </div>
  );
}

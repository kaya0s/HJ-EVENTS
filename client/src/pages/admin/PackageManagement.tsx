import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { axiosInstance } from "@/lib/axios";

type AdminPackage = {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
};

export default function PackageManagement() {
  const [packages, setPackages] = useState<AdminPackage[]>([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [features, setFeatures] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchPackages = async (): Promise<void> => {
    try {
      setLoading(true);
      setError("");
      const res = await axiosInstance.get("/packages");
      const data = res.data as unknown;
      const maybeItems = (data as Record<string, unknown>)?.data ?? data;
      const arr: unknown[] = Array.isArray(maybeItems)
        ? (maybeItems as unknown[])
        : [];
      const normalized: AdminPackage[] = arr.map((p) => {
        const obj = (p ?? {}) as Record<string, unknown>;
        const toStringArray = (v: unknown): string[] =>
          Array.isArray(v)
            ? (v.filter((x) => typeof x === "string") as string[])
            : [];
        return {
          id: (obj.id ?? obj._id ?? "") as string,
          name: (obj.name ?? "") as string,
          price: Number(obj.price ?? 0),
          description: (obj.description ?? "") as string,
          features: toStringArray(obj.features),
        };
      });
      setPackages(normalized);
    } catch {
      setError("Failed to load packages.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  const addPackage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const payload = {
        name: name.trim(),
        price: Number(price) || 0,
        description: description.trim(),
        features: features
          .split(",")
          .map((f) => f.trim())
          .filter(Boolean),
      };
      await axiosInstance.post("/packages", payload);
      setName("");
      setPrice("");
      setDescription("");
      setFeatures("");
      fetchPackages();
    } catch {
      setError("Failed to add package.");
    }
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

      {error && <p className="text-sm text-red-500">{error}</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading && packages.length === 0 && (
          <div className="col-span-full text-center text-muted-foreground">
            Loading packages...
          </div>
        )}
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

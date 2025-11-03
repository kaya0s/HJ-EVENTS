import React from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function Supplier() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Suppliers</h1>
        <Button variant="default">Add Supplier</Button>
      </div>
      <Card className="p-4">
        <p>Supplier management functionality coming soon...</p>
      </Card>
    </div>
  );
}
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useStudioAuthStore } from "@/stores/modal-store";
import { Button } from "../ui/button";
import { useEffect, useState } from "react";
import { Input } from "../ui/input";

export default function StudioAuthModal() {
  const modal = useStudioAuthStore();
  const [studioKey, setStudioKey] = useState("");

  useEffect(() => {
    // Retrieve the studio key from local storage when the modal is mounted
    const savedKey = localStorage.getItem("studio_key");
    if (savedKey) {
      setStudioKey(savedKey);
    }
  }, [modal.isOpen]); // Re-run this effect whenever the modal is opened

  const handleSave = () => {
    if (studioKey.trim() !== "") {
      localStorage.setItem("studio_key", studioKey); // Save the key to local storage
      modal.onClose(); // Close the modal
    } else {
      alert("Studio Key cannot be empty!"); // Display an alert if the field is empty
    }
  };

  return (
    <AlertDialog open={modal.isOpen} onOpenChange={() => modal.onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Add your Studio Key</AlertDialogTitle>
          <AlertDialogDescription>
            Enter your Studio Key below to enable secure access to the
            platform's features.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="mb-4">
          <Input
            type="text"
            value={studioKey}
            onChange={(e) => setStudioKey(e.target.value)}
            placeholder="Enter Studio Key"
          />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <Button onClick={handleSave}>Save</Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

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
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function StudioAuthModal() {
  const modal = useStudioAuthStore();
  const router = useRouter();
  const [studioKey, setStudioKey] = useState("");
  const [serverURL, setServerURL] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setServerURL(Cookies.get("server_url") || "");
    setStudioKey(Cookies.get("studio_key") || "");
  }, [modal.isOpen]);

  const handleSave = async () => {
    if (!serverURL || !studioKey) {
      toast.error("Both Server URL and Studio Key are required!");
      return;
    }

    setLoading(true);
    Cookies.set("studio_key", studioKey, {
      secure: true,
      sameSite: "Strict",
    });
    try {
      const response = await fetch(`${serverURL}/api/check`, {
        credentials: "include",
      });

      const result = await response.json();
      if (response.ok && result.success) {
        Cookies.set("server_url", serverURL, {
          secure: true,
          sameSite: "strict",
        });
        toast.success("Studio Key and Server URL saved successfully!");
        modal.onClose();
        router.refresh();
      } else {
        toast.error(result.message || "Failed to validate Studio Key!");
      }
    } catch (error) {
      toast.error("An error occurred while validating the Studio Key.");
    } finally {
      setLoading(false);
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
        <div className="mb-4 space-y-2">
          <Input
            type="url"
            value={serverURL}
            disabled={loading}
            onChange={(e) => setServerURL(e.target.value)}
            placeholder="Enter Server URL"
          />
          <Input
            value={studioKey}
            disabled={loading}
            onChange={(e) => setStudioKey(e.target.value)}
            type="text"
            placeholder="Enter Studio Key"
          />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "Validating..." : "Save"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

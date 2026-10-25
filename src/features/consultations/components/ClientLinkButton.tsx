import React, { useState } from "react";
import { Link2 } from "lucide-react";
import Button from "@/components/ui/Button";
import { api, ApiError } from "@/lib/api";
import { settingsService } from "@/features/settings/services/settings.service";
import { manageUrl } from "@/features/public-booking/services/publicBooking.service";
import { ShareManageLink } from "@/features/public-booking/components/ShareManageLink";

/** Admin/recepção geram um link novo para a cliente cancelar ou remarcar (o anterior deixa de valer). */
const ClientLinkButton: React.FC<{ appointmentId: string }> = ({ appointmentId }) => {
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (!window.confirm("Gerar um novo link para a cliente? O link anterior deixará de funcionar.")) return;
    setLoading(true);
    setError("");
    try {
      const [link, business] = await Promise.all([
        api.post<{ data: { token: string } }>(`/api/appointments/${appointmentId}/manage-link`),
        settingsService.getBusiness(),
      ]);
      setUrl(manageUrl(business.slug, link.data.token));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Não foi possível gerar o link.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full space-y-2">
      <Button
        size="sm"
        variant="secondary"
        type="button"
        icon={<Link2 size={14} />}
        onClick={() => void generate()}
        isLoading={loading}
        className="w-full sm:w-auto min-h-[44px]"
      >
        Gerar link da cliente
      </Button>
      {error && <p className="text-sm text-danger-700">{error}</p>}
      {url && (
        <div className="rounded-lg border border-primary-100 bg-white p-3 text-left">
          <p className="mb-2 text-xs text-gray-500">Envie à cliente. O link anterior deixou de valer.</p>
          <ShareManageLink url={url} />
        </div>
      )}
    </div>
  );
};

export default ClientLinkButton;

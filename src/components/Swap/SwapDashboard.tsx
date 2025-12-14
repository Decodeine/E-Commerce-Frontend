import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { swapApi, SwapRequest } from "../../services/swapApi";
import Card from "../UI/Card/Card";
import Button from "../UI/Button/Button";
import Loading from "../UI/Loading/Loading";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClock, faMobileAlt, faCheckCircle, faTimesCircle } from "@fortawesome/free-solid-svg-icons";

interface RootState {
  auth: { token: string | null };
}

const statusStyles: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  approved: "bg-green-50 text-green-700 border-green-200",
  rejected: "bg-red-50 text-red-700 border-red-200",
};

const SwapDashboard: React.FC = () => {
  const { token } = useSelector((state: RootState) => state.auth);
  const [swaps, setSwaps] = useState<SwapRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSwaps = async () => {
      try {
        setLoading(true);
        const data = await swapApi.listSwaps();
        setSwaps(data);
      } catch (err: any) {
        setError(err?.response?.data?.detail || "Could not load swaps");
      } finally {
        setLoading(false);
      }
    };
    if (token) {
      fetchSwaps();
    } else {
      setLoading(false);
      setError("Please log in to view your swaps.");
    }
  }, [token]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
        <Loading variant="spinner" size="lg" text="Loading swaps..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <Card className="max-w-xl p-6">
          <div className="text-sm text-red-600">{error}</div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-6">
      <div className="mx-auto max-w-6xl space-y-4 px-4 md:px-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">My Swaps</h1>
            <p className="text-slate-600">Track the status of your swap requests</p>
          </div>
          <Button variant="primary" onClick={() => (window.location.href = "/swap")}>Start a Swap</Button>
        </div>

        {swaps.length === 0 ? (
          <Card className="p-10 text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-500">
              <FontAwesomeIcon icon={faMobileAlt} />
            </div>
            <h3 className="mb-2 text-xl font-bold text-slate-900">No swaps yet</h3>
            <p className="mb-4 text-slate-600">Start a swap to see it appear here.</p>
            <Button variant="primary" onClick={() => (window.location.href = "/swap")}>Start Swap</Button>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {swaps.map((swap) => (
              <Card key={swap.id} className="border border-slate-200 p-5 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                      <FontAwesomeIcon icon={faMobileAlt} />
                    </div>
                    <div>
                      <div className="text-sm text-slate-600">Swap #{swap.id}</div>
                      <div className="text-xs text-slate-500">Created {new Date(swap.created_at).toLocaleDateString()}</div>
                    </div>
                  </div>
                  <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusStyles[swap.status] || "bg-slate-100 text-slate-700"}`}>
                    {swap.status}
                  </span>
                </div>
                <div className="space-y-1 text-sm text-slate-700">
                  <div className="font-semibold text-slate-900">{swap.user_device?.brand} {swap.user_device?.model}</div>
                  <div>Value: ${Number(swap.estimated_value || 0).toFixed(2)}</div>
                  <div>Target ID: {swap.target_device_id}</div>
                  <div>Target Price: ${Number(swap.target_device_price || 0).toFixed(2)}</div>
                  <div className="font-semibold">Difference: ${Number(swap.difference || 0).toFixed(2)}</div>
                </div>
                <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                  <FontAwesomeIcon icon={faClock} />
                  <span>Updated {new Date(swap.updated_at).toLocaleDateString()}</span>
                  {swap.status === 'approved' && <FontAwesomeIcon icon={faCheckCircle} className="text-green-500" />}
                  {swap.status === 'rejected' && <FontAwesomeIcon icon={faTimesCircle} className="text-red-500" />}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SwapDashboard;


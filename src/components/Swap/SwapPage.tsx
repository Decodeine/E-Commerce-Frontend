import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faArrowRight, faCheckCircle, faExclamationTriangle, faLock, faMobileAlt, faRefresh, faSignInAlt, faUserPlus, faEnvelope, faHome, faList, faTimesCircle } from "@fortawesome/free-solid-svg-icons";
import Card from "../UI/Card/Card";
import Button from "../UI/Button/Button";
import Loading from "../UI/Loading/Loading";
import Modal from "../UI/Modal/Modal";
import { API_PATH } from "../../backend_url";
import { swapApi } from "../../services/swapApi";
import { clearPendingSwap, loadPendingSwap, savePendingSwap } from "../../utils/swapStorage";
import { useToast } from "../UI/Toast/ToastProvider";

interface RootState {
  auth: { token: string | null };
}

interface Product {
  id: string | number;
  name: string;
  slug: string;
  price: number | string;
  picture?: string;
}

const MAX_IMAGES = 5;

const SwapPage: React.FC = () => {
  const { token } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [restoring, setRestoring] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [computing, setComputing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [submittedSwapId, setSubmittedSwapId] = useState<number | null>(null);

  const [userDevice, setUserDevice] = useState({
    category: "",
    brand: "",
    model: "",
    storage: "",
    ram: "",
    condition: "",
    issues: [] as string[],
    batteryHealth: "",
    images: [] as string[],
  });

  const [email, setEmail] = useState("");
  const [estimatedValue, setEstimatedValue] = useState<number>(0);
  const [targetDeviceId, setTargetDeviceId] = useState<string | null>(null);
  const [targetDevicePrice, setTargetDevicePrice] = useState<number>(0);

  const difference = useMemo(() => {
    const target = Number(targetDevicePrice || 0);
    const value = Number(estimatedValue || 0);
    return Math.max(target - value, 0);
  }, [estimatedValue, targetDevicePrice]);

  // Restore pending swap
  useEffect(() => {
    const pending = loadPendingSwap();
    if (pending) {
      setUserDevice(pending.userDevice || userDevice);
      setEmail(pending.email || "");
      setEstimatedValue(pending.estimatedValue || 0);
      setTargetDeviceId(pending.targetDeviceId || null);
      setTargetDevicePrice(pending.targetDevicePrice || 0);
      setStep(pending.step || 1);
    }
    setRestoring(false);
  }, []);

  // Save progress
  useEffect(() => {
    if (restoring) return;
    savePendingSwap({
      step,
      userDevice,
      email,
      estimatedValue,
      targetDeviceId,
      targetDevicePrice,
    });
  }, [step, userDevice, email, estimatedValue, targetDeviceId, targetDevicePrice, restoring]);

  // Fetch products for selection
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get(`${API_PATH}products/?limit=12`);
        const list = res.data.results || res.data || [];
        setProducts(list.slice(0, 12));
      } catch (err) {
        console.error("Failed to load products", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const categories = ["Smartphones", "Laptops", "Tablets", "Cameras", "Accessories"];
  const storages = ["64GB", "128GB", "256GB", "512GB", "1TB"];
  const rams = ["4GB", "6GB", "8GB", "12GB", "16GB"];
  const conditions = ["Like New", "Excellent", "Good", "Fair", "Needs Repair"];
  const issueOptions = ["Screen crack", "Camera", "Speaker", "Charging port"];

  const handleIssueToggle = (issue: string) => {
    setUserDevice((prev) => {
      const exists = prev.issues.includes(issue);
      return {
        ...prev,
        issues: exists ? prev.issues.filter((i) => i !== issue) : [...prev.issues, issue],
      };
    });
  };

  const handleImageUpload = async (files: FileList | null) => {
    if (!files) return;
    const current = [...userDevice.images];
    if (current.length >= MAX_IMAGES) {
      showToast({ type: "error", title: "Limit reached", message: "Max 5 photos" });
      return;
    }
    const readers = Array.from(files)
      .slice(0, MAX_IMAGES - current.length)
      .map(
        (file) =>
          new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = () => reject("Failed to read file");
            reader.readAsDataURL(file);
          })
      );
    try {
      const results = await Promise.all(readers);
      setUserDevice((prev) => ({ ...prev, images: [...prev.images, ...results] }));
    } catch {
      showToast({ type: "error", title: "Upload failed", message: "Could not load images" });
    }
  };

  const computeEstimate = () => {
    setComputing(true);
    // Simple pricing algorithm: base + modifiers
    const base = 100;
    const storageBoost = storages.indexOf(userDevice.storage) * 20;
    const ramBoost = rams.indexOf(userDevice.ram) * 15;
    const conditionPenalty = Math.max(0, conditions.indexOf(userDevice.condition) - 2) * 40;
    const issuesPenalty = userDevice.issues.length * 25;
    const batteryPenalty = userDevice.batteryHealth ? Math.max(0, 100 - Number(userDevice.batteryHealth || 100)) : 0;
    const estimate = Math.max(base + storageBoost + ramBoost - conditionPenalty - issuesPenalty - batteryPenalty, 50);
    setEstimatedValue(Number(estimate.toFixed(2)));
    setComputing(false);
    setStep(3);
  };

  const goNext = () => setStep((s) => Math.min(s + 1, 4));
  const goBack = () => setStep((s) => Math.max(s - 1, 1));

  const requireAuth = () => {
    if (!token) {
      setShowAuthModal(true);
      return true;
    }
    return false;
  };

  const handleSubmit = async () => {
    // Validate email
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showToast({ type: "error", title: "Invalid Email", message: "Please enter a valid email address." });
      return;
    }

    if (requireAuth()) return;
    setSubmitting(true);
    try {
      console.log('🔄 Submitting swap:', {
        userDevice,
        email: email.trim(),
        estimatedValue,
        targetDeviceId: targetDeviceId || "",
        targetDevicePrice,
        difference,
      });
      
      const swapResponse = await swapApi.createSwap({
        userDevice,
        email: email.trim(),
        estimatedValue,
        targetDeviceId: targetDeviceId || "",
        targetDevicePrice,
        difference,
      });
      
      console.log('✅ Swap submitted successfully:', swapResponse);
      clearPendingSwap();
      setSubmittedSwapId(swapResponse.id as number);
      setShowSuccessModal(true);
    } catch (err: any) {
      console.error('❌ Swap submission error:', err);
      console.error('❌ Error response:', err?.response?.data);
      // Extract detailed error message
      let errorMsg = "Unable to submit swap. Please try again.";
      if (err?.response?.data) {
        if (err.response.data.detail) {
          errorMsg = err.response.data.detail;
        } else if (err.response.data.error) {
          errorMsg = err.response.data.error;
        } else if (err.response.data.message) {
          errorMsg = err.response.data.message;
        } else if (typeof err.response.data === 'string') {
          errorMsg = err.response.data;
        } else if (err.response.data.errors) {
          // Handle validation errors
          const errors = err.response.data.errors;
          errorMsg = Object.entries(errors).map(([key, value]) => {
            return `${key}: ${Array.isArray(value) ? value.join(', ') : value}`;
          }).join('\n');
        }
      } else if (err?.message) {
        errorMsg = err.message;
      }
      
      console.error('❌ Full error details:', {
        status: err?.response?.status,
        data: err?.response?.data,
        message: errorMsg
      });
      
      setErrorMessage(errorMsg);
      setShowErrorModal(true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAuthRedirect = (path: string) => {
    savePendingSwap({
      step,
      userDevice,
      estimatedValue,
      targetDeviceId,
      targetDevicePrice,
    });
    navigate(path, { state: { from: { pathname: location.pathname } } });
  };

  const renderStepHeader = () => (
    <div className="flex flex-wrap items-center gap-3">
      {[1, 2, 3, 4].map((s) => (
        <div key={s} className={`flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold ${step === s ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-700"}`}>
          <span>{s}</span>
          <span className="hidden sm:inline">
            {s === 1 && "Device"}
            {s === 2 && "Value"}
            {s === 3 && "Target"}
            {s === 4 && "Submit"}
          </span>
        </div>
      ))}
    </div>
  );

  if (loading || restoring) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
        <Loading variant="spinner" size="lg" text="Preparing your swap..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-6">
      <div className="mx-auto max-w-6xl space-y-6 px-4 md:px-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Swap Your Device</h1>
            <p className="text-slate-600">Start a swap even without logging in. We’ll save your progress.</p>
          </div>
          {renderStepHeader()}
        </div>

        {/* Step 1 */}
        {step === 1 && (
          <Card className="p-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Category</label>
                <select className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2" value={userDevice.category} onChange={(e) => setUserDevice({ ...userDevice, category: e.target.value })}>
                  <option value="">Select category</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Brand</label>
                <input className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2" value={userDevice.brand} onChange={(e) => setUserDevice({ ...userDevice, brand: e.target.value })} placeholder="e.g., Apple" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Model</label>
                <input className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2" value={userDevice.model} onChange={(e) => setUserDevice({ ...userDevice, model: e.target.value })} placeholder="Model name" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Storage</label>
                <select className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2" value={userDevice.storage} onChange={(e) => setUserDevice({ ...userDevice, storage: e.target.value })}>
                  <option value="">Select storage</option>
                  {storages.map((s) => (<option key={s} value={s}>{s}</option>))}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">RAM</label>
                <select className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2" value={userDevice.ram} onChange={(e) => setUserDevice({ ...userDevice, ram: e.target.value })}>
                  <option value="">Select RAM</option>
                  {rams.map((r) => (<option key={r} value={r}>{r}</option>))}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Condition</label>
                <select className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2" value={userDevice.condition} onChange={(e) => setUserDevice({ ...userDevice, condition: e.target.value })}>
                  <option value="">Select condition</option>
                  {conditions.map((c) => (<option key={c} value={c}>{c}</option>))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-slate-700">Issues</label>
                <div className="flex flex-wrap gap-2">
                  {issueOptions.map((issue) => (
                    <button
                      key={issue}
                      type="button"
                      className={`rounded-full border px-3 py-1 text-sm transition ${userDevice.issues.includes(issue) ? "border-blue-600 bg-blue-50 text-blue-700" : "border-slate-300 bg-white text-slate-700"}`}
                      onClick={() => handleIssueToggle(issue)}
                    >
                      {issue}
                    </button>
                  ))}
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-slate-700">Battery Health (%)</label>
                <input type="number" min={0} max={100} className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2" value={userDevice.batteryHealth} onChange={(e) => setUserDevice({ ...userDevice, batteryHealth: e.target.value })} />
              </div>
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-slate-700">Upload Photos (max 5)</label>
                <div className="flex flex-wrap items-center gap-3">
                  <label className="flex h-20 w-24 cursor-pointer items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 text-slate-500 transition hover:border-blue-400 hover:text-blue-600">
                    <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleImageUpload(e.target.files)} />
                    <FontAwesomeIcon icon={faMobileAlt} />
                  </label>
                  {userDevice.images.map((img, idx) => (
                    <div key={idx} className="relative h-20 w-24 overflow-hidden rounded-lg border border-slate-200">
                      <img src={img} alt={`upload-${idx}`} className="h-full w-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <Button variant="primary" onClick={() => { setStep(2); }}>
                Next
              </Button>
            </div>
          </Card>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <Card className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                <FontAwesomeIcon icon={faRefresh} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">Estimate Value</h3>
                <p className="text-slate-600">We’ll save this locally until you submit.</p>
              </div>
            </div>
            <Button variant="primary" onClick={computeEstimate} disabled={computing}>
              {computing ? "Computing..." : "Compute Estimate"}
            </Button>
            {estimatedValue > 0 && (
              <div className="rounded-lg bg-blue-50 p-4 text-blue-800">
                Estimated value: <span className="font-bold">${estimatedValue.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <Button variant="outline" onClick={goBack} icon={faArrowLeft}>Back</Button>
              <Button variant="primary" onClick={goNext} disabled={!estimatedValue} icon={faArrowRight}>Next</Button>
            </div>
          </Card>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900">Select Target Device</h3>
              <span className="text-sm text-slate-600">Choose one product</span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((p) => {
                const price = typeof p.price === "string" ? parseFloat(p.price) : p.price;
                const selected = targetDeviceId === String(p.id);
                return (
                  <div key={p.id} className={`rounded-xl border p-4 shadow-sm transition hover:shadow-md ${selected ? "border-blue-500 ring-2 ring-blue-200" : "border-slate-200"}`} onClick={() => { setTargetDeviceId(String(p.id)); setTargetDevicePrice(price); }}>
                    <div className="mb-3 h-40 overflow-hidden rounded-lg bg-slate-100">
                      {p.picture ? <img src={p.picture} alt={p.name} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-slate-400">No Image</div>}
                    </div>
                    <div className="text-sm font-semibold text-slate-900">{p.name}</div>
                    <div className="text-sm text-slate-700">${price?.toFixed(2)}</div>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between">
              <Button variant="outline" onClick={goBack} icon={faArrowLeft}>Back</Button>
              <Button variant="primary" onClick={() => setStep(4)} disabled={!targetDeviceId} icon={faArrowRight}>Next</Button>
            </div>
          </Card>
        )}

        {/* Step 4 */}
        {step === 4 && (
          <Card className="p-6 space-y-4">
            <div className="flex items-center gap-3 rounded-lg bg-blue-50 p-4 text-blue-800">
              <FontAwesomeIcon icon={faCheckCircle} />
              <div>
                <div className="font-bold">Review & Submit</div>
                <div>Difference to pay: ${difference.toFixed(2)}</div>
              </div>
            </div>
            
            {/* Email Field (Required) */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                required
              />
              <p className="mt-1 text-xs text-slate-500">
                We'll send you updates about your swap request and the final device value via email.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-slate-200 p-4">
                <h4 className="mb-2 font-semibold text-slate-900">Your Device</h4>
                <div className="space-y-1 text-sm text-slate-700">
                  <div>{userDevice.brand} {userDevice.model}</div>
                  <div>{userDevice.storage} • {userDevice.ram}</div>
                  <div>Condition: {userDevice.condition}</div>
                  <div>Issues: {userDevice.issues.length ? userDevice.issues.join(", ") : "None"}</div>
                  <div>Battery: {userDevice.batteryHealth || "N/A"}%</div>
                  <div className="mt-2 font-semibold text-blue-600">Est. Value: ${estimatedValue.toFixed(2)}</div>
                </div>
              </div>
              <div className="rounded-lg border border-slate-200 p-4">
                <h4 className="mb-2 font-semibold text-slate-900">Target Device</h4>
                <div className="space-y-1 text-sm text-slate-700">
                  {targetDeviceId && products.find(p => String(p.id) === targetDeviceId) && (
                    <div>{products.find(p => String(p.id) === targetDeviceId)?.name}</div>
                  )}
                  <div>Price: ${targetDevicePrice?.toFixed(2)}</div>
                  <div className="mt-2 font-semibold text-blue-700">Difference: ${difference.toFixed(2)}</div>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap justify-between gap-3">
              <Button variant="outline" onClick={goBack} icon={faArrowLeft}>Back</Button>
              <div className="flex flex-col gap-2">
                {!token && (
                  <div className="flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-amber-700">
                    <FontAwesomeIcon icon={faExclamationTriangle} />
                    <span>Login or create account to submit. Your email is required.</span>
                  </div>
                )}
                <Button 
                  variant="primary" 
                  onClick={handleSubmit} 
                  icon={faLock} 
                  disabled={submitting || !email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)}
                >
                  {submitting ? "Submitting..." : "Submit Swap Request"}
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>

      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <Card className="w-full max-w-md p-6">
            <h3 className="mb-2 text-xl font-bold text-slate-900">Sign in to finish</h3>
            <p className="mb-4 text-sm text-slate-600">We saved your swap progress. Log in or create an account to submit.</p>
            <div className="space-y-2">
              <Button fullWidth variant="primary" icon={faSignInAlt} onClick={() => handleAuthRedirect("/login")}>Login</Button>
              <Button fullWidth variant="outline" icon={faUserPlus} onClick={() => handleAuthRedirect("/register")}>Create Account</Button>
            </div>
            <button className="mt-4 w-full text-sm text-slate-500 hover:text-slate-700" onClick={() => setShowAuthModal(false)}>Cancel</button>
          </Card>
        </div>
      )}

      {/* Error Modal */}
      <Modal
        isOpen={showErrorModal}
        onClose={() => {
          setShowErrorModal(false);
          setErrorMessage("");
        }}
        title=""
        size="sm"
      >
        <div className="text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
            <FontAwesomeIcon icon={faTimesCircle} className="text-5xl text-red-600" />
          </div>
          
          <h2 className="mb-3 text-2xl font-bold text-slate-900">Swap Submission Failed</h2>
          
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-left">
            <p className="text-sm font-medium text-red-800">
              {errorMessage}
            </p>
          </div>
          
          <div className="mb-6 space-y-2 text-sm text-slate-600">
            <p className="font-semibold text-slate-900">Please try:</p>
            <ul className="list-inside list-disc space-y-1 text-left">
              <li>Check your internet connection</li>
              <li>Verify all required fields are filled</li>
              <li>Ensure your email is valid</li>
              <li>Try again in a few moments</li>
            </ul>
          </div>
          
          <div className="flex justify-center gap-3">
            <Button
              variant="primary"
              onClick={() => {
                setShowErrorModal(false);
                setErrorMessage("");
              }}
            >
              Try Again
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setShowErrorModal(false);
                setErrorMessage("");
                navigate("/");
              }}
            >
              Go to Homepage
            </Button>
          </div>
        </div>
      </Modal>

      {/* Success Modal */}
      <Modal
        isOpen={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          navigate("/account/swaps");
        }}
        title=""
        size="sm"
        closeOnBackdropClick={false}
        closeOnEscape={false}
      >
        <div className="text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
            <FontAwesomeIcon icon={faCheckCircle} className="text-5xl text-green-600" />
          </div>
          
          <h2 className="mb-3 text-2xl font-bold text-slate-900">Swap Request Submitted!</h2>
          
          <p className="mb-2 text-slate-600">
            Your swap request has been successfully submitted.
          </p>
          
          {submittedSwapId && (
            <p className="mb-6 text-sm text-slate-500">
              Request ID: <span className="font-semibold text-blue-600">#{submittedSwapId}</span>
            </p>
          )}
          
          <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4 text-left">
            <div className="mb-2 flex items-start gap-3">
              <FontAwesomeIcon icon={faEnvelope} className="mt-1 text-blue-600" />
              <div>
                <p className="font-semibold text-blue-900">What happens next?</p>
                <ul className="mt-2 space-y-1 text-sm text-blue-800">
                  <li>• Our admin team will review your device details</li>
                  <li>• You'll receive an email with the final device value</li>
                  <li>• Once approved, you can complete your swap</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button
              variant="primary"
              onClick={() => {
                setShowSuccessModal(false);
                navigate("/account/swaps");
              }}
              icon={<FontAwesomeIcon icon={faList} />}
            >
              View My Swaps
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setShowSuccessModal(false);
                navigate("/");
              }}
              icon={<FontAwesomeIcon icon={faHome} />}
            >
              Go to Homepage
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SwapPage;


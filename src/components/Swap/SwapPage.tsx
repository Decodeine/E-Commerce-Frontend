import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faArrowRight,
  faCheckCircle,
  faExclamationTriangle,
  faMobileAlt,
  faPlus,
  faTrash,
  faEnvelope,
  faHome,
  faList,
  faTimesCircle,
} from "@fortawesome/free-solid-svg-icons";
import Button from "../UI/Button/Button";
import Loading from "../UI/Loading/Loading";
import Modal from "../UI/Modal/Modal";
import { API_PATH } from "../../backend_url";
import { swapApi } from "../../services/swapApi";
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

interface DeviceDetails {
  id: string;
  category: string;
  brand: string;
  model: string;
  storage: string;
  ram: string;
  condition: string;
  issues: string[];
  batteryHealth: string;
  images: string[];
}

const MAX_DEVICES = 5;
const MAX_IMAGES_PER_DEVICE = 5;

const SwapPage: React.FC = () => {
  const { token } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [submittedSwapId, setSubmittedSwapId] = useState<number | null>(null);

  const [numberOfDevices, setNumberOfDevices] = useState(1);
  const [devices, setDevices] = useState<DeviceDetails[]>([
    {
      id: "1",
      category: "",
      brand: "",
      model: "",
      storage: "",
      ram: "",
      condition: "",
      issues: [],
      batteryHealth: "",
      images: [],
    },
  ]);
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [targetDeviceId, setTargetDeviceId] = useState<string | null>(null);
  const [targetDevicePrice, setTargetDevicePrice] = useState<number>(0);

  const categories = ["Smartphones", "Laptops", "Tablets", "Cameras", "Accessories"];
  const storages = ["64GB", "128GB", "256GB", "512GB", "1TB"];
  const rams = ["4GB", "6GB", "8GB", "12GB", "16GB"];
  const conditions = ["Like New", "Excellent", "Good", "Fair", "Needs Repair"];
  const issueOptions = ["Screen crack", "Camera", "Speaker", "Charging port", "Battery", "Other"];

  // Fetch products for target device selection
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get(`${API_PATH}products/?limit=20`);
        const list = res.data.results || res.data || [];
        setProducts(list.slice(0, 20));
      } catch (err) {
        console.error("Failed to load products", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Update devices array when numberOfDevices changes
  useEffect(() => {
    if (numberOfDevices > devices.length) {
      // Add new devices
      const newDevices = Array.from({ length: numberOfDevices - devices.length }, (_, i) => ({
        id: String(devices.length + i + 1),
        category: "",
        brand: "",
        model: "",
        storage: "",
        ram: "",
        condition: "",
        issues: [],
        batteryHealth: "",
        images: [],
      }));
      setDevices([...devices, ...newDevices]);
    } else if (numberOfDevices < devices.length) {
      // Remove devices
      setDevices(devices.slice(0, numberOfDevices));
    }
  }, [numberOfDevices]);

  const updateDevice = (deviceId: string, updates: Partial<DeviceDetails>) => {
    setDevices(devices.map((d) => (d.id === deviceId ? { ...d, ...updates } : d)));
  };

  const handleIssueToggle = (deviceId: string, issue: string) => {
    updateDevice(deviceId, {
      issues: devices
        .find((d) => d.id === deviceId)
        ?.issues.includes(issue)
        ? devices.find((d) => d.id === deviceId)!.issues.filter((i) => i !== issue)
        : [...(devices.find((d) => d.id === deviceId)?.issues || []), issue],
    });
  };

  const handleImageUpload = async (deviceId: string, files: FileList | null) => {
    if (!files) return;
    const device = devices.find((d) => d.id === deviceId);
    if (!device) return;

    const current = device.images;
    if (current.length >= MAX_IMAGES_PER_DEVICE) {
      showToast({ type: "error", title: "Limit reached", message: `Max ${MAX_IMAGES_PER_DEVICE} photos per device` });
      return;
    }

    const readers = Array.from(files)
      .slice(0, MAX_IMAGES_PER_DEVICE - current.length)
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
      updateDevice(deviceId, { images: [...current, ...results] });
    } catch {
      showToast({ type: "error", title: "Upload failed", message: "Could not load images" });
    }
  };

  const removeImage = (deviceId: string, imageIndex: number) => {
    const device = devices.find((d) => d.id === deviceId);
    if (!device) return;
    updateDevice(deviceId, {
      images: device.images.filter((_, idx) => idx !== imageIndex),
    });
  };

  const computeEstimate = (device: DeviceDetails): number => {
    const base = 100;
    const storageBoost = storages.indexOf(device.storage) * 20;
    const ramBoost = rams.indexOf(device.ram) * 15;
    const conditionPenalty = Math.max(0, conditions.indexOf(device.condition) - 2) * 40;
    const issuesPenalty = device.issues.length * 25;
    const batteryPenalty = device.batteryHealth
      ? Math.max(0, 100 - Number(device.batteryHealth || 100))
      : 0;
    return Math.max(base + storageBoost + ramBoost - conditionPenalty - issuesPenalty - batteryPenalty, 50);
  };

  const totalEstimatedValue = devices.reduce((sum, device) => sum + computeEstimate(device), 0);
  const difference = Math.max(targetDevicePrice - totalEstimatedValue, 0);

  const canProceedToStep2 = () => {
    return numberOfDevices >= 1 && numberOfDevices <= MAX_DEVICES;
  };

  const canProceedToStep3 = () => {
    return devices.every(
      (device) =>
        device.category &&
        device.brand &&
        device.model &&
        device.storage &&
        device.ram &&
        device.condition
    );
  };

  const canSubmit = () => {
    return (
      email.trim() &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) &&
      fullName.trim() &&
      phoneNumber.trim() &&
      targetDeviceId &&
      canProceedToStep3()
    );
  };

  const handleSubmit = async () => {
    if (!canSubmit()) {
      showToast({ type: "error", title: "Validation Error", message: "Please fill all required fields." });
      return;
    }

    setSubmitting(true);
    try {
      // For now, submit the first device (can be extended to support multiple devices)
      const primaryDevice = devices[0];

      const swapResponse = await swapApi.createSwap({
        userDevice: {
          category: primaryDevice.category,
          brand: primaryDevice.brand,
          model: primaryDevice.model,
          storage: primaryDevice.storage,
          ram: primaryDevice.ram,
          condition: primaryDevice.condition,
          issues: primaryDevice.issues,
          batteryHealth: primaryDevice.batteryHealth,
          images: primaryDevice.images,
          numberOfDevices: numberOfDevices,
          allDevices: devices,
          fullName: fullName,
          phoneNumber: phoneNumber,
        },
        email: email.trim(),
        estimatedValue: totalEstimatedValue,
        targetDeviceId: targetDeviceId || "",
        targetDevicePrice: targetDevicePrice,
        difference: difference,
      });

      setSubmittedSwapId(swapResponse.id as number);
      setShowSuccessModal(true);
    } catch (err: any) {
      console.error("Swap submission error:", err);
      let errorMsg = "Unable to submit swap. Please try again.";
      if (err?.response?.data) {
        if (err.response.data.detail) {
          errorMsg = err.response.data.detail;
        } else if (err.response.data.error) {
          errorMsg = err.response.data.error;
        } else if (err.response.data.message) {
          errorMsg = err.response.data.message;
        }
      } else if (err?.message) {
        errorMsg = err.message;
      }
      setErrorMessage(errorMsg);
      setShowErrorModal(true);
    } finally {
      setSubmitting(false);
    }
  };

  const goNext = () => {
    if (step === 1 && canProceedToStep2()) {
      setStep(2);
    } else if (step === 2 && canProceedToStep3()) {
      setStep(3);
    }
  };

  const goBack = () => {
    setStep(Math.max(1, step - 1));
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
        <Loading variant="spinner" size="lg" text="Loading swap form..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="mx-auto max-w-4xl px-4 md:px-6">
        {/* Banner Notice */}
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-800">
          <div className="flex items-start gap-3">
            <FontAwesomeIcon icon={faExclamationTriangle} className="mt-0.5 text-amber-600" />
            <div>
              <p className="font-semibold">Please note:</p>
              <p className="text-sm">
                At the moment, we do not offer "swap from home" outside Lagos. We are actively working to expand this
                service to other states soon!
              </p>
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-4xl font-bold text-slate-900">Swap Your Device</h1>
          <p className="text-slate-600">Trade in your old device for a new one</p>
        </div>

        {/* Step Indicator */}
        <div className="mb-8 flex items-center justify-center gap-4">
          {[1, 2, 3].map((s) => (
            <React.Fragment key={s}>
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full font-semibold transition ${
                  step === s
                    ? "bg-blue-600 text-white"
                    : step > s
                    ? "bg-green-500 text-white"
                    : "bg-slate-200 text-slate-600"
                }`}
              >
                {step > s ? <FontAwesomeIcon icon={faCheckCircle} /> : s}
              </div>
              {s < 3 && (
                <div
                  className={`h-1 w-16 transition ${
                    step > s ? "bg-green-500" : "bg-slate-200"
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="mb-4 text-center text-sm text-slate-600">
          <span className="font-semibold">
            {step === 1 && "Number of Devices"}
            {step === 2 && "Device Details"}
            {step === 3 && "Summary"}
          </span>
        </div>

        {/* Step 1: Number of Devices */}
        {step === 1 && (
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-6 text-2xl font-bold text-slate-900">Number of Devices to Swap</h2>
            <div className="mb-6">
              <label className="mb-3 block text-sm font-semibold text-slate-700">
                How many devices would you like to swap?
              </label>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => setNumberOfDevices(Math.max(1, numberOfDevices - 1))}
                  className="flex h-12 w-12 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                  disabled={numberOfDevices <= 1}
                >
                  <span className="text-xl">−</span>
                </button>
                <div className="flex h-12 w-20 items-center justify-center rounded-lg border-2 border-blue-600 bg-blue-50 text-2xl font-bold text-blue-600">
                  {numberOfDevices}
                </div>
                <button
                  type="button"
                  onClick={() => setNumberOfDevices(Math.min(MAX_DEVICES, numberOfDevices + 1))}
                  className="flex h-12 w-12 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                  disabled={numberOfDevices >= MAX_DEVICES}
                >
                  <span className="text-xl">+</span>
                </button>
              </div>
              <p className="mt-3 text-sm text-slate-500">You can swap up to {MAX_DEVICES} devices at once</p>
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="primary" onClick={goNext} disabled={!canProceedToStep2()}>
                Next <FontAwesomeIcon icon={faArrowRight} className="ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Device Details */}
        {step === 2 && (
          <div className="space-y-6">
            {devices.map((device, index) => (
              <div key={device.id} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-xl font-bold text-slate-900">Device {index + 1} Details</h2>
                  {devices.length > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        setDevices(devices.filter((d) => d.id !== device.id));
                        setNumberOfDevices(numberOfDevices - 1);
                      }}
                      className="text-red-600 hover:text-red-700"
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  )}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                      value={device.category}
                      onChange={(e) => updateDevice(device.id, { category: e.target.value })}
                    >
                      <option value="">Select category</option>
                      {categories.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Brand <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                      value={device.brand}
                      onChange={(e) => updateDevice(device.id, { brand: e.target.value })}
                      placeholder="e.g., Apple, Samsung"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Model <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                      value={device.model}
                      onChange={(e) => updateDevice(device.id, { model: e.target.value })}
                      placeholder="Model name"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Storage <span className="text-red-500">*</span>
                    </label>
                    <select
                      className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                      value={device.storage}
                      onChange={(e) => updateDevice(device.id, { storage: e.target.value })}
                    >
                      <option value="">Select storage</option>
                      {storages.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      RAM <span className="text-red-500">*</span>
                    </label>
                    <select
                      className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                      value={device.ram}
                      onChange={(e) => updateDevice(device.id, { ram: e.target.value })}
                    >
                      <option value="">Select RAM</option>
                      {rams.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Condition <span className="text-red-500">*</span>
                    </label>
                    <select
                      className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                      value={device.condition}
                      onChange={(e) => updateDevice(device.id, { condition: e.target.value })}
                    >
                      <option value="">Select condition</option>
                      {conditions.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-semibold text-slate-700">Issues (if any)</label>
                    <div className="flex flex-wrap gap-2">
                      {issueOptions.map((issue) => (
                        <button
                          key={issue}
                          type="button"
                          className={`rounded-full border px-3 py-1 text-sm transition ${
                            device.issues.includes(issue)
                              ? "border-blue-600 bg-blue-50 text-blue-700"
                              : "border-slate-300 bg-white text-slate-700 hover:border-blue-400"
                          }`}
                          onClick={() => handleIssueToggle(device.id, issue)}
                        >
                          {issue}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">Battery Health (%)</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                      value={device.batteryHealth}
                      onChange={(e) => updateDevice(device.id, { batteryHealth: e.target.value })}
                      placeholder="e.g., 85"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Upload Photos (max {MAX_IMAGES_PER_DEVICE})
                    </label>
                    <div className="flex flex-wrap items-center gap-3">
                      <label className="flex h-24 w-24 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 text-slate-500 transition hover:border-blue-400 hover:text-blue-600">
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          onChange={(e) => handleImageUpload(device.id, e.target.files)}
                        />
                        <FontAwesomeIcon icon={faMobileAlt} className="text-2xl" />
                      </label>
                      {device.images.map((img, idx) => (
                        <div key={idx} className="relative h-24 w-24 overflow-hidden rounded-lg border border-slate-200">
                          <img src={img} alt={`device-${device.id}-${idx}`} className="h-full w-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removeImage(device.id, idx)}
                            className="absolute right-1 top-1 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
                          >
                            <FontAwesomeIcon icon={faTimesCircle} className="text-xs" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <div className="flex justify-between gap-3">
              <Button variant="outline" onClick={goBack} icon={faArrowLeft}>
                Back
              </Button>
              <Button variant="primary" onClick={goNext} disabled={!canProceedToStep3()}>
                Next <FontAwesomeIcon icon={faArrowRight} className="ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Summary */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-6 text-2xl font-bold text-slate-900">Summary</h2>

              {/* Contact Information */}
              <div className="mb-6 space-y-4">
                <h3 className="text-lg font-semibold text-slate-900">Contact Information</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                      placeholder="Your full name"
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                      placeholder="+234 800 000 0000"
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                      placeholder="your.email@example.com"
                      required
                    />
                    <p className="mt-1 text-xs text-slate-500">
                      We'll send you updates about your swap request via email.
                    </p>
                  </div>
                </div>
              </div>

              {/* Your Devices Summary */}
              <div className="mb-6">
                <h3 className="mb-4 text-lg font-semibold text-slate-900">Your Devices</h3>
                <div className="space-y-3">
                  {devices.map((device, index) => (
                    <div key={device.id} className="rounded-lg border border-slate-200 p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold text-slate-900">
                            Device {index + 1}: {device.brand} {device.model}
                          </p>
                          <p className="text-sm text-slate-600">
                            {device.storage} • {device.ram} • {device.condition}
                          </p>
                          {device.issues.length > 0 && (
                            <p className="text-xs text-slate-500">Issues: {device.issues.join(", ")}</p>
                          )}
                        </div>
                        <p className="font-semibold text-blue-600">
                          ${computeEstimate(device).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex justify-between border-t border-slate-200 pt-4">
                  <span className="font-semibold text-slate-900">Total Estimated Value:</span>
                  <span className="text-xl font-bold text-blue-600">${totalEstimatedValue.toFixed(2)}</span>
                </div>
              </div>

              {/* Target Device Selection */}
              <div className="mb-6">
                <h3 className="mb-4 text-lg font-semibold text-slate-900">Select Target Device</h3>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {products.map((p) => {
                    const price = typeof p.price === "string" ? parseFloat(p.price) : p.price;
                    const selected = targetDeviceId === String(p.id);
                    return (
                      <div
                        key={p.id}
                        className={`cursor-pointer rounded-xl border p-4 shadow-sm transition hover:shadow-md ${
                          selected ? "border-blue-500 ring-2 ring-blue-200" : "border-slate-200"
                        }`}
                        onClick={() => {
                          setTargetDeviceId(String(p.id));
                          setTargetDevicePrice(price);
                        }}
                      >
                        <div className="mb-3 h-40 overflow-hidden rounded-lg bg-slate-100">
                          {p.picture ? (
                            <img src={p.picture} alt={p.name} className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full items-center justify-center text-slate-400">No Image</div>
                          )}
                        </div>
                        <div className="text-sm font-semibold text-slate-900">{p.name}</div>
                        <div className="text-sm text-slate-700">${price?.toFixed(2)}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Final Summary */}
              {targetDeviceId && (
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-blue-900">Target Device Price:</p>
                      <p className="text-sm text-blue-700">
                        {products.find((p) => String(p.id) === targetDeviceId)?.name}
                      </p>
                    </div>
                    <p className="text-lg font-bold text-blue-600">${targetDevicePrice.toFixed(2)}</p>
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t border-blue-200 pt-3">
                    <p className="font-semibold text-blue-900">Amount to Pay:</p>
                    <p className="text-xl font-bold text-blue-600">${difference.toFixed(2)}</p>
                  </div>
                </div>
              )}

              <div className="mt-6 flex justify-between gap-3">
                <Button variant="outline" onClick={goBack} icon={faArrowLeft}>
                  Back
                </Button>
                <Button
                  variant="primary"
                  onClick={handleSubmit}
                  disabled={submitting || !canSubmit()}
                >
                  {submitting ? "Submitting..." : "Submit Swap Request"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

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
          <p className="mb-2 text-slate-600">Your swap request has been successfully submitted.</p>
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
            <p className="text-sm font-medium text-red-800">{errorMessage}</p>
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
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SwapPage;

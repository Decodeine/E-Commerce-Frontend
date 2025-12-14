import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUsers,
  faRocket,
  faAward,
  faHeart,
  faShieldAlt,
  faHandshake,
  faGlobe,
  faLightbulb,
  faCheckCircle
} from "@fortawesome/free-solid-svg-icons";
import Card from "../UI/Card/Card";
import Button from "../UI/Button/Button";
import { useNavigate } from "react-router-dom";

const About: React.FC = () => {
  const navigate = useNavigate();

  const values = [
    {
      icon: faUsers,
      title: "Customer First",
      description: "We prioritize our customers' needs and satisfaction above all else."
    },
    {
      icon: faRocket,
      title: "Innovation",
      description: "Constantly evolving to bring you the latest and greatest products."
    },
    {
      icon: faAward,
      title: "Quality",
      description: "We only offer products that meet our high standards of excellence."
    },
    {
      icon: faHeart,
      title: "Integrity",
      description: "Honest, transparent, and ethical in everything we do."
    }
  ];

  const features = [
    {
      icon: faShieldAlt,
      title: "Secure Shopping",
      description: "Your data and payments are protected with industry-leading security."
    },
    {
      icon: faHandshake,
      title: "Trusted Partners",
      description: "We work with verified suppliers and trusted brands worldwide."
    },
    {
      icon: faGlobe,
      title: "Global Reach",
      description: "Serving customers across the globe with fast and reliable shipping."
    },
    {
      icon: faLightbulb,
      title: "Expert Support",
      description: "Our team is here to help you find exactly what you need."
    }
  ];

  const stats = [
    { number: "10K+", label: "Happy Customers" },
    { number: "50K+", label: "Products Sold" },
    { number: "100+", label: "Brand Partners" },
    { number: "24/7", label: "Support Available" }
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-700 py-16 text-white">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="mb-4 text-4xl font-bold md:text-5xl">About Us</h1>
            <p className="text-lg text-blue-100 md:text-xl">
              We're dedicated to providing you with the best shopping experience, 
              offering quality products at competitive prices with exceptional customer service.
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl space-y-12 px-4 py-12 md:px-6">
        {/* Stats Section */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {stats.map((stat, index) => (
            <Card key={index} className="p-6 text-center">
              <div className="mb-2 text-3xl font-bold text-blue-600 md:text-4xl">{stat.number}</div>
              <div className="text-sm font-medium text-slate-600 md:text-base">{stat.label}</div>
            </Card>
          ))}
        </div>

        {/* Our Story Section */}
        <Card className="p-8 md:p-12">
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-6 text-3xl font-bold text-slate-900">Our Story</h2>
            <div className="space-y-4 text-slate-700">
              <p className="text-lg leading-relaxed">
                Founded with a vision to revolutionize online shopping, we've grown from a small startup 
                to a trusted e-commerce platform serving thousands of customers worldwide. Our journey 
                began with a simple mission: to make quality products accessible to everyone.
              </p>
              <p className="leading-relaxed">
                Over the years, we've built strong relationships with leading brands and suppliers, 
                ensuring that our customers always have access to the latest products at competitive prices. 
                We believe in transparency, quality, and putting our customers first in everything we do.
              </p>
              <p className="leading-relaxed">
                Today, we continue to innovate and improve, constantly enhancing our platform to provide 
                you with the best shopping experience possible. From our user-friendly interface to our 
                fast and reliable shipping, every aspect of our service is designed with you in mind.
              </p>
            </div>
          </div>
        </Card>

        {/* Our Values Section */}
        <div>
          <h2 className="mb-8 text-center text-3xl font-bold text-slate-900">Our Values</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {values.map((value, index) => (
              <Card key={index} className="p-6 text-center transition-shadow hover:shadow-md">
                <div className="mb-4 flex justify-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                    <FontAwesomeIcon icon={value.icon} className="text-2xl" />
                  </div>
                </div>
                <h3 className="mb-2 text-xl font-semibold text-slate-900">{value.title}</h3>
                <p className="text-sm text-slate-600">{value.description}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* Features Section */}
        <div>
          <h2 className="mb-8 text-center text-3xl font-bold text-slate-900">Why Choose Us</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {features.map((feature, index) => (
              <Card key={index} className="p-6">
                <div className="flex gap-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white">
                    <FontAwesomeIcon icon={feature.icon} className="text-xl" />
                  </div>
                  <div>
                    <h3 className="mb-2 text-lg font-semibold text-slate-900">{feature.title}</h3>
                    <p className="text-sm text-slate-600">{feature.description}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Mission Section */}
        <Card className="border-blue-200 bg-blue-50 p-8 md:p-12">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="mb-6 text-3xl font-bold text-slate-900">Our Mission</h2>
            <p className="mb-8 text-lg leading-relaxed text-slate-700">
              To empower customers worldwide by providing access to high-quality products, 
              exceptional service, and a seamless shopping experience that exceeds expectations. 
              We're committed to building trust, fostering relationships, and creating value 
              for everyone we serve.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-700">
                <FontAwesomeIcon icon={faCheckCircle} className="text-green-600" />
                Quality Products
              </div>
              <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-700">
                <FontAwesomeIcon icon={faCheckCircle} className="text-green-600" />
                Fast Shipping
              </div>
              <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-700">
                <FontAwesomeIcon icon={faCheckCircle} className="text-green-600" />
                24/7 Support
              </div>
              <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-700">
                <FontAwesomeIcon icon={faCheckCircle} className="text-green-600" />
                Easy Returns
              </div>
            </div>
          </div>
        </Card>

        {/* CTA Section */}
        <Card className="border-blue-600 bg-gradient-to-r from-blue-600 to-blue-700 p-8 text-center text-white md:p-12">
          <h2 className="mb-4 text-3xl font-bold">Ready to Start Shopping?</h2>
          <p className="mb-8 text-lg text-blue-100">
            Explore our wide selection of products and discover why thousands of customers trust us.
          </p>
          <Button
            variant="outline"
            size="lg"
            onClick={() => navigate('/products')}
            className="bg-white text-blue-600 hover:bg-blue-50"
          >
            Browse Products
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default About;

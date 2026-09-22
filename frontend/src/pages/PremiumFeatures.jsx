import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useTheme } from "../context/ThemeContext"
import { useAuth } from "../context/AuthContext"
import api from "../services/api"
import LoadingSpinner from "../components/LoadingSpinner"

export default function PremiumFeatures() {
  const navigate = useNavigate()
  const { colors } = useTheme()
  const { updateUser } = useAuth()
  const [subscriptionStatus, setSubscriptionStatus] = useState(null)
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [processing, setProcessing] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState("upi")

  useEffect(() => {
    fetchSubscriptionData()
  }, [])

  const getPlanBillingLabel = (plan) => {
    if (plan.id === "monthly") return "/month"
    if (plan.id === "quarterly") return "/3 months"
    if (plan.id === "yearly") return "/year"
    return `/ ${plan.duration_days} days`
  }

  const getPlanFeatures = (planId) => {
    const allFeatures = {
      "Live GPS Tracking": "Track your vehicle's location in real-time.",
      "Garage Locator": "Find authorized service centers and garages near you.",
      "Service History Backup": "Keep a digital log of all your vehicle's services.",
      "24/7 Roadside Assistance": "Get help anytime, anywhere with our priority support.",
      "Exclusive Discounts": "Enjoy special discounts on services and parts from partner garages.",
      "Annual Vehicle Health Report": "Receive a detailed annual report on your vehicle's health.",
      "Ad-Free Experience": "Enjoy the app without any advertisements.",
      "Garage Map": "Access our interactive map to find and navigate to garages."
    };

    let planFeatures = [];
    if (planId === "monthly") {
      planFeatures = [
        "Live GPS Tracking",
        "Service History Backup",
      ];
    } else if (planId === "quarterly") {
      planFeatures = [
        "Live GPS Tracking",
        "Service History Backup",
        "24/7 Roadside Assistance",
        "Garage Map",
      ];
    } else if (planId === "yearly") {
      planFeatures = Object.keys(allFeatures);
    }

    return (
      <>
        {Object.keys(allFeatures).map(feature => (
          <li key={feature} style={{ 
            padding: "8px 0", 
            fontSize: "14px", 
            borderBottom: `1px solid ${colors.border}`,
            color: planFeatures.includes(feature) ? colors.text : colors.textSecondary,
            textDecoration: planFeatures.includes(feature) ? 'none' : 'line-through'
          }}>
            {planFeatures.includes(feature) ? '✅' : '❌'} {feature}
            <p style={{fontSize: '12px', color: colors.textSecondary, margin: '4px 0 0 22px'}}>{allFeatures[feature]}</p>
          </li>
        ))}
      </>
    );
  }

  const applyLocalPremium = (premiumUntil, daysRemaining = 10) => {
    const normalizedDate = premiumUntil || new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString()
    const nextStatus = {
      is_premium: true,
      premium_until: normalizedDate,
      days_remaining: daysRemaining
    }

    setSubscriptionStatus(nextStatus)
    updateUser({ is_premium: true, premium_until: normalizedDate })
    localStorage.setItem("isPremium", "true")
    localStorage.setItem("premiumUntil", normalizedDate)
    return nextStatus
  }

  const fetchSubscriptionData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Fetch subscription status
      const statusResponse = await api.get(`/api/subscription/status`)
      setSubscriptionStatus(statusResponse.data)

      // Fetch available plans
      const plansResponse = await api.get(`/api/subscription/plans`)
      setPlans(plansResponse.data)
    } catch (err) {
      console.error("Error fetching subscription data:", err)
      const localPremium = localStorage.getItem("isPremium") === "true"
      const localPremiumUntil = localStorage.getItem("premiumUntil")
      if (localPremium) {
        setSubscriptionStatus({
          is_premium: true,
          premium_until: localPremiumUntil,
          days_remaining: localPremiumUntil ? 10 : 0
        })
      }
      setPlans([])
    } finally {
      setLoading(false)
    }
  }

  const handleDemoActivate = async () => {
    try {
      setProcessing(true)
      console.log("Activating demo access...")
      
      const response = await api.post(
        `/api/subscription/activate-demo`,
        {}
      )
      
      console.log("Demo activation response:", response.data)
      
      const premiumUntil = response.data.premium_until || new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString()
      applyLocalPremium(premiumUntil, response.data.days_remaining || 10)
      
      // Show success and redirect
      alert("✅ Premium activated for 10 days! Redirecting to garage map...")
      navigate("/garage-map")
    } catch (error) {
      console.error("Demo activation error:", error)
      const localPremium = applyLocalPremium(null, 10)
      const errorMsg = error.response?.data?.detail || error.message || "Activation failed"
      alert(`⚠️ ${errorMsg}. Premium has been enabled locally for 10 days.`)
      setSubscriptionStatus(localPremium)
      navigate("/garage-map")
    } finally {
      setProcessing(false)
    }
  }

  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan)
    setShowPaymentModal(true)
  }

  const handleProcessPayment = async () => {
    if (!selectedPlan) return

    try {
      setProcessing(true)

      // Initiate payment (api already has base URL, no need to prefix)
      const response = await api.post(
        `/api/subscription/initiate-payment`,
        {
          plan_id: selectedPlan.id,
          payment_method: paymentMethod
        }
      )

      // In real scenario, redirect to payment gateway
      // For demo, auto-verify with slight delay
      setTimeout(() => {
        verifyPayment(response.data.transaction_id)
      }, 2000)
    } catch (error) {
      alert("Payment initiation failed: " + (error.response?.data?.detail || error.message))
      setProcessing(false)
    }
  }

  const verifyPayment = async (transactionId) => {
    try {
      const response = await api.post(
        `/api/subscription/verify-payment/${transactionId}`,
        {}
      )

      const premiumUntil = response.data.premium_until || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      setSubscriptionStatus({
        is_premium: true,
        premium_until: premiumUntil,
        days_remaining: 30
      })

      updateUser({ is_premium: true, premium_until: premiumUntil })
      localStorage.setItem("isPremium", "true")
      localStorage.setItem("premiumUntil", premiumUntil)

      setShowPaymentModal(false)
      alert("✅ Payment successful! Premium activated!")
      navigate("/garage-map")
    } catch (error) {
      const premiumUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      applyLocalPremium(premiumUntil, 30)
      setShowPaymentModal(false)
      alert("⚠️ Payment gateway unavailable, but premium access was enabled locally for 30 days.")
      navigate("/garage-map")
    } finally {
      setProcessing(false)
    }
  }

  const styles = {
    container: {
      maxWidth: "1200px",
      margin: "0 auto",
      padding: "30px 20px",
      backgroundColor: colors.background,
      minHeight: "100vh"
    },
    header: {
      textAlign: "center",
      marginBottom: "40px",
      color: colors.text
    },
    title: {
      fontSize: "32px",
      fontWeight: "bold",
      marginBottom: "10px",
      backgroundImage: "linear-gradient(135deg, #1976d2 0%, #00bcd4 100%)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent"
    },
    subtitle: {
      fontSize: "16px",
      color: colors.textSecondary,
      marginBottom: "20px"
    },
    aiLimitInfo: {
      maxWidth: "720px",
      margin: "0 auto 16px auto",
      textAlign: "center",
      fontSize: "14px",
      background: "#fff8e1",
      color: "#8d6e63",
      border: "1px solid #ffe082",
      borderRadius: "8px",
      padding: "10px 14px",
    },
    statusBox: {
      backgroundColor: subscriptionStatus?.is_premium ? "#e8f5e9" : "#fff3e0",
      border: `2px solid ${subscriptionStatus?.is_premium ? "#4caf50" : "#ff9800"}`,
      borderRadius: "8px",
      padding: "20px",
      marginBottom: "40px",
      textAlign: "center"
    },
    statusText: {
      fontSize: "18px",
      fontWeight: "bold",
      marginBottom: "10px",
      color: subscriptionStatus?.is_premium ? "#2e7d32" : "#e65100"
    },
    plansGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
      gap: "20px",
      marginBottom: "40px"
    },
    planCard: {
      backgroundColor: colors.card,
      border: "2px solid " + colors.border,
      borderRadius: "12px",
      padding: "30px",
      textAlign: "center",
      transition: "all 0.3s",
      cursor: "pointer",
      boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
    },
    planCardHover: {
      transform: "translateY(-5px)",
      boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
      borderColor: "#1976d2"
    },
    planName: {
      fontSize: "20px",
      fontWeight: "bold",
      marginBottom: "10px",
      color: colors.text
    },
    planPrice: {
      fontSize: "36px",
      fontWeight: "bold",
      color: "#1976d2",
      marginBottom: "5px"
    },
    planCurrency: {
      fontSize: "14px",
      color: colors.textSecondary
    },
    planDuration: {
      fontSize: "14px",
      color: colors.textSecondary,
      marginBottom: "20px"
    },
    planFeatures: {
      listStyle: "none",
      padding: "0",
      marginBottom: "25px",
      textAlign: "left"
    },
    featureItem: {
      padding: "8px 0",
      fontSize: "14px",
      color: colors.text,
      borderBottom: "1px solid " + colors.border
    },
    button: {
      padding: "12px 24px",
      fontSize: "14px",
      fontWeight: "bold",
      border: "none",
      borderRadius: "6px",
      cursor: "pointer",
      transition: "all 0.3s",
      backgroundColor: "#1976d2",
      color: "white"
    },
    buttonHover: {
      backgroundColor: "#1565c0",
      transform: "scale(1.05)"
    },
    demoButton: {
      marginTop: "20px",
      padding: "12px 24px",
      fontSize: "14px",
      fontWeight: "bold",
      border: "2px solid #4caf50",
      borderRadius: "6px",
      cursor: "pointer",
      backgroundColor: "transparent",
      color: "#4caf50",
      transition: "all 0.3s"
    },
    modal: {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0,0,0,0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000
    },
    modalContent: {
      backgroundColor: colors.card,
      borderRadius: "12px",
      padding: "30px",
      maxWidth: "500px",
      width: "90%",
      boxShadow: "0 8px 32px rgba(0,0,0,0.2)"
    },
    modalTitle: {
      fontSize: "24px",
      fontWeight: "bold",
      marginBottom: "20px",
      color: colors.text
    },
    paymentMethodGroup: {
      marginBottom: "20px"
    },
    radioGroup: {
      display: "flex",
      alignItems: "center",
      padding: "10px",
      marginBottom: "10px",
      border: "1px solid " + colors.border,
      borderRadius: "6px",
      cursor: "pointer"
    },
    modalButtons: {
      display: "flex",
      gap: "10px",
      marginTop: "20px"
    },
    modalButtonCancel: {
      flex: 1,
      padding: "10px",
      backgroundColor: "#eee",
      border: "none",
      borderRadius: "6px",
      cursor: "pointer",
      fontWeight: "bold"
    },
    modalButtonPay: {
      flex: 1,
      padding: "10px",
      backgroundColor: "#1976d2",
      color: "white",
      border: "none",
      borderRadius: "6px",
      cursor: "pointer",
      fontWeight: "bold"
    }
  }

  if (loading) {
    return <LoadingSpinner />
  }

  if (error && !subscriptionStatus) {
    return (
      <div style={{ maxWidth: "800px", margin: "80px auto", padding: "40px", textAlign: "center" }}>
        <div style={{ fontSize: "48px", marginBottom: "20px" }}>⚠️</div>
        <h2 style={{ color: colors.text, marginBottom: "12px" }}>Unable to Load Premium Features</h2>
        <p style={{ color: colors.textSecondary, marginBottom: "24px" }}>{error}</p>
        <button
          onClick={fetchSubscriptionData}
          style={{ padding: "12px 28px", background: "#1976d2", color: "#fff", border: "none", borderRadius: "8px", fontSize: "15px", cursor: "pointer", fontWeight: "600" }}
        >
          🔄 Retry
        </button>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>🎁 Premium Features</h1>
        <p style={styles.subtitle}>
          Unlock exclusive features to access nearby car garages on our interactive map!
        </p>
        <p style={styles.aiLimitInfo}>Free users get 10 SmartVahaan AI chats. Upgrade to any paid plan for unlimited AI chats.</p>
      </div>

      {subscriptionStatus?.is_premium && (
        <>
          <div style={styles.statusBox}>
            <p style={styles.statusText}>✅ You are a Premium Member!</p>
            <p style={{ color: "#2e7d32", marginBottom: "10px" }}>
              Premium until: {subscriptionStatus.premium_until ? new Date(subscriptionStatus.premium_until).toLocaleDateString() : "N/A"}
            </p>
            <p style={{ color: "#2e7d32", marginBottom: "20px" }}>
              Days remaining: {subscriptionStatus.days_remaining || 0}
            </p>
            <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
              <button
                style={{...styles.button, backgroundColor: "#4caf50"}}
                onClick={() => navigate("/garage-map")}
              >
                🗺️ Open Garage Map
              </button>
              <button
                style={{...styles.button, backgroundColor: "#1976d2"}}
                onClick={() => navigate("/maintenance")}
              >
                🔧 AI Maintenance
              </button>
            </div>
          </div>

          {/* Show all premium features for premium users */}
          <div style={{ marginBottom: "40px" }}>
            <h2 style={{ ...styles.title, fontSize: "24px", marginBottom: "20px" }}>
              🌟 Your Premium Features
            </h2>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: "20px"
            }}>
              {[
                { icon: "📍", title: "Live GPS Tracking", desc: "Track your vehicle's location in real-time." },
                { icon: "🗺️", title: "Garage Locator Map", desc: "Find authorized service centers and garages near you." },
                { icon: "📋", title: "Service History Backup", desc: "Keep a digital log of all your vehicle's services." },
                { icon: "🚨", title: "24/7 Roadside Assistance", desc: "Get help anytime, anywhere with priority support." },
                { icon: "🎁", title: "Exclusive Discounts", desc: "Special discounts on services and parts from partner garages." },
                { icon: "📊", title: "Annual Vehicle Health Report", desc: "Receive a detailed annual report on your vehicle's health." },
                { icon: "🚫", title: "Ad-Free Experience", desc: "Enjoy the app without any advertisements." },
              ].map((feature) => (
                <div key={feature.title} style={{
                  backgroundColor: colors.cardBackground,
                  border: "2px solid #4caf50",
                  borderRadius: "12px",
                  padding: "20px",
                  display: "flex",
                  gap: "14px",
                  alignItems: "flex-start",
                  boxShadow: "0 2px 8px rgba(76,175,80,0.1)"
                }}>
                  <span style={{ fontSize: "28px", flexShrink: 0 }}>{feature.icon}</span>
                  <div>
                    <div style={{ fontWeight: "bold", fontSize: "15px", color: colors.text, marginBottom: "4px" }}>
                      {feature.title}
                    </div>
                    <div style={{ fontSize: "13px", color: colors.textSecondary }}>
                      {feature.desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}


      {!subscriptionStatus?.is_premium && (
        <>
          <div style={styles.plansGrid}>
            {plans.map((plan) => (
              <div
                key={plan.id}
                style={{
                  ...styles.planCard,
                  borderColor: selectedPlan?.id === plan.id ? "#1976d2" : styles.planCard.borderColor
                }}
              >
                <h2 style={styles.planName}>{plan.name}</h2>
                <div style={styles.planPrice}>
                  ₹{plan.amount}
                  <span style={styles.planCurrency}>{getPlanBillingLabel(plan)}</span>
                </div>
                <p style={styles.planDuration}>{plan.duration_days} days access</p>

                <ul style={styles.planFeatures}>
                  {getPlanFeatures(plan.id)}
                </ul>

                <button
                  style={styles.button}
                  onClick={() => handleSelectPlan(plan)}
                >
                  Upgrade to {plan.name}
                </button>
              </div>
            ))}
          </div>

          <div style={{ textAlign: "center", marginTop: "40px" }}>
            <p style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "20px", color: colors.text }}>
              Want to try before buying?
            </p>
            <button
              style={{...styles.demoButton, opacity: processing ? 0.6 : 1}}
              onClick={handleDemoActivate}
              disabled={processing}
            >
              {processing ? "Activating..." : "🎯 Try Premium Free (10 days)"}
            </button>
            <p style={{ fontSize: "12px", color: colors.textSecondary, marginTop: "10px" }}>
              Get instant access to all premium features for 10 days - no credit card required!
            </p>
          </div>
        </>
      )}

      {/* Payment Modal */}
      {showPaymentModal && selectedPlan && (
        <div style={styles.modal} onClick={() => !processing && setShowPaymentModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>Complete Payment</h2>

            <div style={styles.paymentMethodGroup}>
              <p style={{ fontWeight: "bold", marginBottom: "10px", color: colors.text }}>
                Select Payment Method:
              </p>

              {["upi", "card", "wallet"].map((method) => (
                <label key={method} style={styles.radioGroup}>
                  <input
                    type="radio"
                    name="payment_method"
                    value={method}
                    checked={paymentMethod === method}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    style={{ marginRight: "10px" }}
                  />
                  <span style={{ flex: 1, textAlign: "left" }}>
                    {method === "upi" && "📱 UPI"}
                    {method === "card" && "💳 Credit/Debit Card"}
                    {method === "wallet" && "👛 Digital Wallet"}
                  </span>
                </label>
              ))}
            </div>

            <div style={{
              backgroundColor: "#f5f5f5",
              padding: "15px",
              borderRadius: "6px",
              marginBottom: "20px"
            }}>
              <p style={{ margin: "0 0 8px 0", fontSize: "14px", color: colors.textSecondary }}>
                Order Summary:
              </p>
              <p style={{ margin: "8px 0", fontSize: "16px", fontWeight: "bold", color: colors.text }}>
                {selectedPlan.name}
              </p>
              <p style={{ margin: "8px 0", fontSize: "20px", fontWeight: "bold", color: "#1976d2" }}>
                ₹{selectedPlan.amount}
              </p>
            </div>

            <div style={styles.modalButtons}>
              <button
                style={styles.modalButtonCancel}
                onClick={() => setShowPaymentModal(false)}
                disabled={processing}
              >
                Cancel
              </button>
              <button
                style={{...styles.modalButtonPay, opacity: processing ? 0.6 : 1}}
                onClick={handleProcessPayment}
                disabled={processing}
              >
                {processing ? "Processing..." : "Pay Now"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const LoadingSpinner = () => {
  return (
    <div
      style={{
        minHeight: "40vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          padding: "14px 20px",
          borderRadius: 10,
          backgroundColor: "rgba(255, 255, 255, 0.08)",
          color: "#f8fafc",
          fontWeight: 600,
          letterSpacing: 0.2,
        }}
      >
        Loading...
      </div>
    </div>
  );
};

export default LoadingSpinner;
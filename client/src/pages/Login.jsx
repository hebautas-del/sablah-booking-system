const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const res = await API.post("/auth/login", formData);

    const user = res.data.user;

    // safety check (VERY IMPORTANT)
    if (!user || !user.role) {
      alert("Login error: role missing");
      return;
    }

    localStorage.setItem("token", res.data.token);
    localStorage.setItem("name", user.name);
    localStorage.setItem("role", user.role);
    localStorage.setItem("email", user.email);

    console.log("LOGGED USER ROLE:", user.role); // DEBUG

    if (user.role === "owner") {
      navigate("/owner-dashboard");
    } 
    else if (user.role === "admin") {
      navigate("/admin-dashboard");
    } 
    else {
      navigate("/venues");
    }

  } catch (err) {
    alert(err.response?.data?.message || "Login failed");
  }
};
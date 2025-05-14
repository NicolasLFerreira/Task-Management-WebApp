"use client"

const Header = () => {
  const handleLogout = () => {
    // Remove the auth token
    localStorage.removeItem("auth_token")
    // Redirect to auth page
    window.location.href = "/auth"
  }

  return (
    <header className="bg-teal-600 text-white py-4 px-6 shadow-md flex justify-between items-center">
      <h1 className="text-2xl font-bold tracking-wide">Tickaway</h1>
      <button
        onClick={handleLogout}
        className="bg-white text-teal-600 px-4 py-2 rounded hover:bg-gray-100 transition-colors"
      >
        Logout
      </button>
    </header>
  )
}

export default Header

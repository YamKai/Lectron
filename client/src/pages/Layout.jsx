import NavBar from "../components/NavBar";
import { Outlet } from "react-router-dom";

function Layout() {
  return (
    <>
      <NavBar />
      <Outlet style={{ paddingTop: "52px" }} />
    </>
  );
}

export default Layout;
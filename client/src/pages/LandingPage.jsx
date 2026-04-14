import { useState, useEffect, useRef } from "react";

function LandingPage({onLogin}) {
  const sectionRef = useRef(null);
  const [select, setSelect] = useState("about");

  const scrollToSection = () => {
    if (sectionRef.current) {
      sectionRef.current?.scrollIntoView({ behavior: "smooth" });
    }}
    return (
        <div>
            <div
                style={{
                    position: "relative",
                    top: 0,
                    left: 0,
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    padding: "20px 10px",
                    zIndex: 10,
                    color: "white"
                }}
            >
                {/* LEFT SPACER */}
                <div style={{ flex: 1 }} />

                {/* CENTER TEXT LINKS */}
                <div style={{ display: "flex", gap: "150px", fontSize: "16px" }}>
                    <span onClick={() => { setSelect("about"); scrollToSection(); }} style={{ cursor: "pointer"}}>About</span>
                    <span onClick={() => {setSelect("overview"); scrollToSection();}} style={{ cursor: "pointer"}}>Overview</span>
                    <span style={{ cursor: "pointer"}}>Courses</span>
                    <span style={{ cursor: "pointer"}}>Team</span>
                </div>

                {/* RIGHT PILL BUTTON */}
                <div style={{ flex: 1, display: "flex", justifyContent: "flex-end" }}>
                    <button
                    onClick={onLogin}
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            padding: "10px 20px",
                            borderRadius: "999px",
                            border: "none",
                            boxSizing: "border-box",
                            background: "white",
                            color: "#4285F4",
                            border: "3px solid #4285F4",
                            fontWeight: "600",
                            gap: "2px",
                            boxShadow: "0 0px 15px rgba(0, 238, 255, 0.78)",
                            transform: "translateX(-30px)",
                            textAlign: "center",
                            cursor: "pointer",
                            lineHeight: "1"
                        }}
                    >
                        <img src=" https://upload.wikimedia.org/wikipedia/commons/0/09/IOS_Google_icon.png"
                            alt="google"
                            style={{
                                width: "18px",
                                height: "18px",
                                display: "block",
                                transform: "translateY(-1px)"
                            }}
                        />

                        Sign In
                    </button>
                </div>
                <div
                    style={{
                        position: "fixed",
                        top: "90%",
                        left: "300px",
                        transform: "translateY(-50%)",
                        zIndex: 5
                    }}
                >
                </div>

            </div>
            <div
                style={{
                    position: "relative",
                    width: "100%",
                    height: "100vh",
                    overflow: "hidden"
                }}
            >
                {/* GET STARTED BUTTON */}
                <div
                    style={{
                        position: "absolute",
                        top: "70%",
                        left: "200px"
                    }}
                >
                    <button
                    onClick={onLogin}
                        style={{
                            padding: "14px 28px",
                            borderRadius: "999px",
                            border: "none",
                            background: "#FFFF",
                            color: "#4285F4",
                            boxShadow: "0 0px 30px rgba(0, 238, 255, 0.77)",
                            border: "3px solid #4285F4",
                            fontSize: "30px",
                            fontWeight: "600",
                            cursor: "pointer"
                        }}
                    >
                        Get Started
                    </button>
                </div>
            </div>


            {/* BACKGROUND */}
            {select == "about" && (
                <img
                    src="/Land_About.svg"
                    alt="background"
                    style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "auto",
                        objectFit: "cover",
                        zIndex: -1
                    }}
                />
            )}
            {select == "overview" && (
                <img
                    src="/Land_Over.svg"
                    alt="background"
                    style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "auto",
                        objectFit: "cover",
                        zIndex: -1
                    }}
                />
            )}
            <img
                src="/logo_svg.svg"
                alt="logo"
                style={{
                    position: "absolute",
                    top: "-109.1%",
                    left: "-44vw",
                    width: "100%",
                    height: "auto",
                    objectFit: "none",
                    zIndex: -1
                }}
            />

            {/* TEST CONTENT*/}
            <div ref={sectionRef} style={{
                height: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white"
            }}>
            </div>
        </div>
    );
}

export default LandingPage;
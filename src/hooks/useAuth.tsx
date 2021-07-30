import React, { useContext } from "react";
import AuthContext from "../contexts/AuthContext";

export default function useAuth() {
    const auth = useContext(AuthContext);
    return auth;
}
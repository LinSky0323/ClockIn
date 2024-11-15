import {useState,useContext,createContext} from "react"

const AuthContext = createContext()

export const useAuth = ()=>useContext(AuthContext)

export const AuthProvider = ({children})=>{
    const [user,setUser] = useState(null)
    const [department,setDepartment] = useState(null)
    const [access,setAccess] = useState(null)
    const [intime,setIntime] = useState(null)
    const [outtime,setOuttime] = useState(null)
    const [timeloading,setTimeloading] = useState(false)
    const [state,setState] = useState(0)
    const login = (userData,departmentData,accessData)=>{
        setUser(userData)
        setDepartment(departmentData)
        setAccess(accessData)
    }

    const logout = ()=>{
        setUser(null)
        setDepartment(null)
        setAccess(null)
    }

    return(
        <AuthContext.Provider value = {{access,user,department,login,logout,intime,outtime,setIntime,setOuttime,timeloading,setTimeloading,state,setState}}>
            {children}
        </AuthContext.Provider>
    )
}
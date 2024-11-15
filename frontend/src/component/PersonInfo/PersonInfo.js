import { useAuth } from "../../AuthContext"
import styles from "./PersonInfo.module.css"

export function PersonInfo(){
    const {access,user,department} = useAuth()
    return(
        <div className={styles.container}>
            {access === 3?
            <>
                <div className={styles.unsignin}>{department}</div>
                <div className={styles.unsignin}>{user}</div>
            </>:access ===2?
                <div className={styles.unsignin}>{user}</div>
                :
                access ===1?
                <div className={styles.unsignin}>{user}</div>
                :
            <div className={styles.unsignin}>尚未登入</div>}
            
        </div>
    )
}
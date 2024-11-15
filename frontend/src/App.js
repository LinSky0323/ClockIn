import ReactClock from '@uiw/react-clock';
import styles from "./app.module.css"
import { DateBar } from './component/DateBar/DateBar';
import { Header } from './component/Header/Header';
import { PersonInfo } from './component/PersonInfo/PersonInfo';
import { LoginForm } from './component/LoginForm/LoginForm';
import { useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { ClockInForm } from './component/ClockInForm/ClockInForm';
import { TodayTime } from './component/TodayTime/TodayTime';
import { ApplyForm } from './component/ApplyForm/ApplyForm';
import { StateButton } from './component/Button/StateButton/StateButton';
import { SearchList } from './component/SearchList/SearchList';
import { SearchApply } from './component/SearchApply/SearchApply';
import { LogoutButton } from './component/Button/LogoutButton/LogoutButton';
import { DTimeList } from './component/DTimeList/DTimeList';
import { DApplyList } from './component/DAppltList/DApplyList';
import { Account } from './component/Account/Account';
import { NewCICO } from './component/NewCICO/NewCICO';
import { SFCICO } from './component/SFCICO/SFCICO';


const List3 = [{"item":"申請補打","no":"1"},{"item":"查詢出勤","no":"2"},{"item":"查詢申請","no":"3"}]
const List2 = [{"item":"查詢出勤狀況","no":"4"},{"item":"檢核查詢申請","no":"5"}]
const List1 =  [{"item":"創建帳號","no":"6"},{"item":"新增時間","no":"7"},{"item":"查詢/修改","no":"8"}]
function App() {
  const {access,user,department,login,intime,outtime,state} = useAuth()
  const [loading,setLoading] = useState(false)

  useEffect(()=>{

    const check_user = async(token)=>{
      const result = await fetch("http://localhost:5000/user",{
        method:"GET",
        headers:{
          "Content-type":"application/json",
          "Authorization":`Bearer ${token}`
        }
      })
      const data = await result.json()
      return data
    }

    const token = localStorage.getItem("token")
    if(token){
      check_user(token).then((userdata)=>{
        login(userdata.name,userdata.department,userdata.access);
        setLoading(true)
      })
    }
    else{
      setLoading(true)
    }
    
  },[login])
  if(!loading){
    return
  }
  return (
    <>
     <Header/>
    <main className={styles.head}>
      <div className={styles.datebar}>
        <DateBar/>
        <PersonInfo/>
      </div>
      <div>
        <ReactClock/>
      </div>
    </main>
    {access===3?
    <>
      <LogoutButton/>
      <TodayTime/>
      {(!intime || !outtime) && <ClockInForm/>}
      <StateButton statelist = {List3}/>
      {(state===1) && <ApplyForm/>}
      {(state===2) && <SearchList/>}
      {(state===3) && <SearchApply/>}
    </>
    :access===2?
    <>
      <LogoutButton/>
      <StateButton statelist = {List2}/>
      {(state===4) && <DTimeList/>}
      {(state===5) && <DApplyList/>}
    </>
    :access===1?
    <>
      <LogoutButton/>
      <StateButton statelist = {List1}/>
      {(state===6) && <Account/>}
      {(state===7) && <NewCICO/>}
      {(state===8) && <SFCICO/>}

    </>
    :
    <>
      <LoginForm/>
    </>
    }
    </>
  );
}

export default App;

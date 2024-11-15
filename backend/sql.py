import MySQLdb
# 連線到mysql
def query_handle(query):
    db = MySQLdb.connect("my_project-db-1","root","pass","mydatabase")
    cursor = db.cursor()
    cursor.execute(query)
    return db,cursor

def convert_seconds_to_time(seconds):
    hours = seconds // 3600  # 1小時 = 3600秒
    minutes = (seconds % 3600) // 60  # 剩餘分鐘
    secs = seconds % 60  # 剩餘秒數
    return f"{hours:02}:{minutes:02}:{secs:02}"


#創建帳號
def create_user(name,account,password,department):
    query = f'select * from Users where Account = "%s"' % account
    query1 = f'select * from Department where ID = "%s"' % department
    query2 = f'insert into Users(Name,Account,Password,Department) values ("%s","%s","%s",%s)' % (name,account,password,department)
    try:
        db,cursor = query_handle(query)
        results = cursor.fetchall()
        db.close()
        if not results:
            db1,cursor1 = query_handle(query1)
            result = cursor1.fetchall()
            db1.close()
            if not result:
                return {"no":"無此部門代碼"}
            else:
                db2,cursor2 = query_handle(query2)
                db2.commit()
                db2.close()
                return {"ok":"帳戶創建成功"}
        else:
            return {"no":"此工號已註冊"}
    except Exception as e:
        error_info = {
            "error_type": type(e).__name__,
            "message": str(e),
            "query": query,
            "params": (account,)
        }
        print(f"Error: {error_info}")
        return error_info
#登入帳號
def login_user(account,password):
    query = f'select * from Department where Account = "%s" AND Password = "%s"' % (account,password)
    query1 = f'select * from Users where Account = "%s" AND Password = "%s"' % (account,password)
    try:
        db,cursor = query_handle(query)
        result = cursor.fetchall()
        db.close()
        
        if result:
            return {"ok":result,"access":result[0][4],"department":result[0][0]}
        db1,cursor1 = query_handle(query1)
        result1 = cursor1.fetchall()
        db1.close()
        if result1:
            return {"ok":result1,"access":3,"department":result1[0][4]}
        else:
            return {"no":"登入失敗"}
    except Exception as e:
        error_info = {
            "error_type": type(e).__name__,
            "message": str(e),
            "query": query,
            "params": (account,password)
        }
        print(f"Error: {error_info}")
        return error_info
#移除帳號
def delete_user(account):
    query = f'select * from Users where Account = "%s"' % account
    query1 = f'DELETE FROM Users where Account = "%s"' % account
    try:
        db,cursor = query_handle(query)
        results = cursor.fetchall()
        db.close()
        if not results:
            return {"no":"無此工號"}
        else:
            db1,cursor1 = query_handle(query1)
            db1.commit()
            db1.close()
            return {"ok":"該帳號已刪除"}
    except Exception as e:
        error_info = {
            "error_type": type(e).__name__,
            "message": str(e),
            "query": query,
            "params": (account)
        }
        print(f"Error: {error_info}")
        return error_info
#打卡
def clock_IO(userID,date,time):
    query = f'SELECT * FROM CICO WHERE UserID = %s AND Date = "%s"' % (userID,date)
    query1 = f'INSERT INTO CICO (UserID,Date,CITime) VALUES (%s,"%s","%s")' % (userID,date,time)
    query2 = f'UPDATE CICO SET COTime = "%s" WHERE UserID = %s AND Date = "%s"' % (time,userID,date)
    try:
        db,cursor = query_handle(query)
        result = cursor.fetchall()
        db.close()
        if result:
            if result[0][4]:
                return{"no":"今日已打過下班卡"}
            else:
                db2,cursor2 = query_handle(query2)
                db2.commit()
                db2.close()
                return {"ok":"下班打卡成功","CO":time}
        else:
            db1,cursor1 = query_handle(query1)
            db1.commit()
            db1.close()
            return {"ok":"上班打卡成功","CI":time}
        
    except Exception as e:
        error_info = {
            "error_type": type(e).__name__,
            "message": str(e),
            "query": query1,
        }
        print(f"Error: {error_info}")
        return error_info
#申請補打
def apply_send(userID,department,date,ci,time):
    cType = "CITime" if ci == True else "COTime"
    query1 = f'INSERT INTO Apply(UserID,Department,Date,CI,Time) VALUES (%s,%s,"%s",%s,"%s")' % (userID,department,date,ci,time)
    query = f'SELECT * FROM Apply WHERE UserID = %s AND Date = "%s" AND CI = %s AND IsCompleted = 0' % (userID,date,ci) #某人、某天、某個申請是否已存在
    query2 = f'SELECT %s FROM CICO WHERE UserID = %s AND Date = "%s"' % (cType,userID,date)
    try:
        db2,cursor2 = query_handle(query2)
        result2 = cursor2.fetchall()
        db2.close()
        if result2:
            return {"no":"該時段已有打卡紀錄，無法補打"}
        db,cursor = query_handle(query)
        result = cursor.fetchall()
        db.close()
        if result:
            return {"no":"已有提交申請尚未審批"}
        else:
            db1,cursor1 = query_handle(query1)
            db1.commit()
            db1.close()
            return {"ok":"申請已提交"}
    except Exception as e:
        error_info = {
            "error_type": type(e).__name__,
            "message": str(e),
            "query": query,
        }
        print(f"Error: {error_info}")
        return error_info
#同意補打
def apply_agree(id,userID,date,ci,time):
    cType = "CITime" if ci == True else "COTime"
    query = f'SELECT %s FROM CICO WHERE UserID = %s AND Date = "%s"' % (cType,userID,date) #確認是否已有打卡
    query1 = f'INSERT INTO CICO (UserID,Date,%s) VALUES (%s,"%s","%s")' % (cType,userID,date,convert_seconds_to_time(time)) #還沒資料就創建
    query2 = f'UPDATE CICO SET %s = "%s" WHERE UserID = %s AND Date = "%s"' % (cType,convert_seconds_to_time(time),userID,date) #已有其中一筆就更新另一筆
    query3 = f'UPDATE Apply SET IsCompleted = 1 WHERE ID = %s' % id # 0=未處理 1=同意 2=拒絕 3=異常
    query4 = f'UPDATE Apply SET IsCompleted = 3 WHERE ID = %s' % id

    try:
        db1,cursor1 = query_handle(query)
        result = cursor1.fetchall()
        db1.close()
        if result and result[0] and result[0][0]:
            db4,cusro4 = query_handle(query4)
            db4.commit()
            db4.close()
            return{"no":"該時段已有打卡紀錄，無法補打"}
        if not result:
            print(111)
            db,cursor = query_handle(query1)
            db.commit()
            db.close()
        else:
            print(222)
            db,cursor = query_handle(query2)
            db.commit()
            db.close()
        print(33)
        db3,cursor3 = query_handle(query3)
        db3.commit()
        db3.close()
        return {"ok":"補打成功"}
    except Exception as e:
        error_info = {
            "error_type": type(e).__name__,
            "message": str(e),
        }
        print(f"Error: {error_info}")
        return error_info
#拒絕補打
def apply_disagree(id):
    query = f'UPDATE Apply SET IsCompleted = 2 WHERE ID = %s' % id
    try:
       db,cursor = query_handle(query)
       db.commit()
       db.close()
       return {"ok":"已拒絕該申請"}
    except Exception as e:
        error_info = {
            "error_type": type(e).__name__,
            "message": str(e),
        }
        print(f"Error: {error_info}")
        return error_info
#查詢時間 by ID
def search_by_id(userID,timeCondition):
    condition = timeCondition.count("-")
    query = ""
    if condition == 2:
        query = f'SELECT Users.Name,Users.Account,CICO.Date,CICO.CITime,CICO.COTime from Users INNER JOIN CICO ON Users.id = CICO.UserID WHERE CICO.UserID = %s AND CICO.Date = "%s"  ORDER BY CICO.Date DESC;' % (userID,timeCondition)
    else:
        query = f'SELECT Users.Name,Users.Account,CICO.Date,CICO.CITime,CICO.COTime from Users INNER JOIN CICO ON Users.id = CICO.UserID WHERE CICO.UserID = %s AND CICO.Date LIKE "%s"  ORDER BY CICO.Date DESC;' % (userID,timeCondition+"%")
    try:
       db,cursor = query_handle(query)
       result = cursor.fetchall()
       db.close()
       return {"ok":result}
    except Exception as e:
        error_info = {
            "error_type": type(e).__name__,
            "message": str(e),
        }
        print(f"Error: {error_info}")
        return error_info
#取得某個id
def search_id(name,account,department):
    query = ""
    if name:
        query = f'SELECT * FROM Users WHERE Name = "%s"' % name
    else:
        query = f'SELECT * FROM Users WHERE Account = "%s"' % account
    try:
       db,cursor = query_handle(query)
       result = cursor.fetchall()
       db.close()
       if result:
        if result[0][4] != department:
            return {"no":"您沒有權限可以查詢此人的資料"}
        return result[0][0]
       else:
           return {"no":"查無此人"}
    except Exception as e:
        error_info = {
            "error_type": type(e).__name__,
            "message": str(e),
        }
        print(f"Error: {error_info}")
        return error_info
#取得部門的所有人的今日狀態
def search_department_people(department,formatted_day):
    query = f'SELECT u.Name,u.Account,c.Date,c.CITime,c.COTime FROM (SELECT * FROM Users WHERE Department = %s) u INNER JOIN CICO c on u.ID = c.userID WHERE c.Date = "%s" ORDER BY c.Date DESC ;' % (department,formatted_day)
    try:
       db,cursor = query_handle(query)
       result = cursor.fetchall()
       db.close()
       return {"ok":result}
    except Exception as e:
        error_info = {
            "error_type": type(e).__name__,
            "message": str(e),
        }
        print(f"Error: {error_info}")
        return error_info
#取得我今日的打卡狀態
def search_my_list(userID,date):
    query = f'SELECT * FROM CICO WHERE UserID = %s AND Date = "%s" ' % (userID,date)
    try:
       db,cursor = query_handle(query)
       result = cursor.fetchall()
       db.close()
       if not result:
           return {"no":"今日尚未打卡"}
       return {"ok":result[0]}
    except Exception as e:
        error_info = {
            "error_type": type(e).__name__,
            "message": str(e),
        }
        print(f"Error: {error_info}")
        return error_info
#取得我的apply
def search_my_apply(userID):
    query = f'SELECT * FROM Apply WHERE UserID = %s ORDER BY Date DESC' % userID
    try:
       db,cursor = query_handle(query)
       result = cursor.fetchall()
       db.close()
       if not result:
           return {"no":"無補打紀錄"}
       return {"ok":result}
    except Exception as e:
        error_info = {
            "error_type": type(e).__name__,
            "message": str(e),
        }
        print(f"Error: {error_info}")
        return error_info
#取得部門的apply
def search_department_apply(department,Sname,Saccount,Sdate,Stype,Sstate):
    query = f'SELECT Users.Name,Users.Account,Apply.Date,Apply.CI,Apply.Time,Apply.IsCompleted,Apply.ID,Users.ID FROM Users INNER JOIN Apply ON Users.ID = Apply.UserID WHERE Apply.Department = %s ' % department
    if Sname:
        query += f'AND Users.Name = "%s" ' %Sname
    if Saccount:
        query += f'AND Users.Account = "%s" ' %Saccount
    if Sdate:
        query += f'AND Apply.Date = "%s" ' %Sdate
    if Stype:
        query += f'AND Apply.CI = %s ' %Stype
    if Sstate:
        query += f'AND Apply.IsCompleted = %s ' %Sstate
    query += 'ORDER BY Apply.Date DESC'
    try:
       db,cursor = query_handle(query)
       result = cursor.fetchall()
       db.close()
       if not result:
           return {"no":"無補打紀錄"}
       return {"ok":result}
    except Exception as e:
        error_info = {
            "error_type": type(e).__name__,
            "message": str(e),
        }
        print(f"Error: {error_info}")
        return error_info
    return
#直接新增CICO
def push_data(account,date,ci,co):
    query = f'SELECT * FROM CICO WHERE UserID = (select ID from Users where Account = "%s") AND Date = "%s"' %(account,date)
    query1 = f'INSERT INTO CICO (UserID,Date,CITime,COTime) VALUES ((select ID from Users where Account = "%s"),"%s","%s","%s")' % (account,date,ci,co)
    query2 = f'select ID from Users where Account = "%s"' % account
    try:
        db2,cursor2 = query_handle(query2)
        result2 = cursor2.fetchall()
        db2.close()   
        if not result2:
            return {"no":"無此工號"}
        db,cursor = query_handle(query)
        result = cursor.fetchall()
        db.close()
        if result:
            return {"no":"此人當天已有紀錄"}
        else:
            db1,cursor1 = query_handle(query1)
            db1.commit()
            db1.close()
            return {"ok":"新增成功"}
    except Exception as e:
        error_info = {
            "error_type": type(e).__name__,
            "message": str(e),
        }
        print(f"Error: {error_info}")
        return error_info
#查詢全部CICO
def search_data(name,account,department,date):
    queryA = f'select ID from Users where Account = "%s"' % account #有無此人
    queryN = f'select ID from Users where Name = "%s"' % name #有無此人
    queryD = f'select ID from Department where ID = "%s"' % department #有無此人
    query = f'SELECT Users.Name,Users.Account,CICO.Date,CICO.CITime,CICO.COTime,CICO.ID FROM Users INNER JOIN CICO ON Users.ID = CICO.UserID WHERE 0 = 0 '
    try:
        if  name:
            dbN,cursorN = query_handle(queryN)
            resultN = cursorN.fetchall()
            dbN.close()
            if not resultN:
                return {"no":"查無此人"}
            query += f'AND Users.Name = "%s"' %name   
        if  account:
            dbA,cursorA = query_handle(queryA)
            resultA = cursorA.fetchall()
            dbA.close()
            if not resultA:
                return {"no":"查無此人"}
            query += f'AND Users.Account = "%s"' %account   
        if department:
            dbD,cursorD = query_handle(queryD)
            resultD = cursorD.fetchall()
            dbD.close()
            print(resultD)
            print(13)
            if not resultD:
                return {"no":"查無此部門"}
            query += f'AND Users.Department = "%s"' %department       
        if date:
            query += f'AND CICO.Date = "%s"' %date  
        query += 'ORDER BY CICO.Date DESC'
        db,cursor = query_handle(query)
        result = cursor.fetchall()
        db.close()
        if result:
            return {"ok":result}
        else:
            return {"no":"查無資料"}
    except Exception as e:
        error_info = {
            "error_type": type(e).__name__,
            "message": str(e),
        }
        print(f"Error: {error_info}")
        return error_info
    return
#直接修改CICO
def fix_data(id,ci,co):
    query = f'UPDATE CICO SET CITime = "%s" , COTime = "%s" WHERE ID = %s;' % (ci,co,id)
    try:
       db,cursor = query_handle(query)
       db.commit()
       db.close()
       return{"ok":"ok"}
    except Exception as e:
        error_info = {
            "error_type": type(e).__name__,
            "message": str(e),
        }
        print(f"Error: {error_info}")
        return error_info
    return
#直接刪除CICO
def delete_data():
    return








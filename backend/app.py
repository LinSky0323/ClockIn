import flask
from flask import request, jsonify
from flask_cors import CORS, cross_origin
from flask_jwt_extended import JWTManager, create_access_token, jwt_required,get_jwt_identity
from sql import create_user,login_user,delete_user,clock_IO,apply_send,apply_agree,apply_disagree,search_by_id,search_id,search_department_people,search_my_apply,search_department_apply,fix_data,search_my_list,push_data,search_data
from datetime import datetime,timezone,timedelta

app = flask.Flask(__name__)
app.config["DEBUG"] = True
jwt = JWTManager()
app.config["JWT_SECRET_KEY"] = "aabbjjildsfjlkj"
jwt.init_app(app)
CORS(app)

#創建帳號
@app.route("/user",methods=['POST'])
@jwt_required()
def Create_user():
    name = request.json.get("name",None)
    account = request.json.get("account",None)
    password = request.json.get("password",None)
    department = request.json.get("department",None)
    result = create_user(name,account,password,department)
    return jsonify(result), 200
#登入帳號
@app.route("/user",methods=['PUT'])
def Login_user():
    account = request.json.get("account",None)
    password = request.json.get("password",None)
    result = login_user(account,password)
    if "ok" not in  result:
        return jsonify(result), 200
    userID = result["ok"][0][0]
    department = result["department"]
    access = result["access"]
    name = result["ok"][0][1]
    identity = {"userID":userID,"department":department,"access":access,"name":name}
    access_token = create_access_token(identity = identity)
    return jsonify(token = access_token,access = access,name = result["ok"][0][1],department = department)
#驗證登入資訊
@app.route("/user",methods=["GET"])
@jwt_required()
def Check_user():
    identity = get_jwt_identity()
    name = identity["name"]
    department = identity["department"]
    access = identity["access"]
    return jsonify({"name":name,"department":department,"access":access}),200
#移除帳號
@app.route("/user",methods=['DELETE'])
@jwt_required()
def Delete_user():
    account = request.json.get("account",None)
    result = delete_user(account)
    return jsonify(result), 200
#打卡
@app.route("/time",methods=["POST"])
@jwt_required()
def Clock_IO():
    identity = get_jwt_identity()
    userID = identity["userID"]
    dt1 = datetime.now()
    dt2 = dt1.astimezone(timezone(timedelta(hours=8))) # 轉換時區 -> 東八區
    formatted_day = dt2.strftime("%Y-%m-%d")
    formatted_time = dt2.strftime("%H:%M:%S")
    result = clock_IO(userID,formatted_day,formatted_time)
    return jsonify(result), 200
#申請補打
@app.route("/apply",methods=["POST"])
@jwt_required()
def Apply_send():
    identity = get_jwt_identity()
    userID = identity["userID"]
    department = identity["department"]
    date = request.json.get("date",None)
    ci = request.json.get("CI",None)
    time = request.json.get("time",None)
    result = apply_send(userID,department,date,ci,time)
    return jsonify(result), 200  
#批審補打        
@app.route("/apply",methods=["PUT"])
@jwt_required()
def Apply_fix():
    identity = get_jwt_identity()
    userID = request.json.get("userID",None)
    id = request.json.get("id",None)
    date = request.json.get("date",None)
    ci = request.json.get("ci",None)
    time = request.json.get("time",None)
    agree = request.json.get("agree",None)
    if agree:
        result = apply_agree(id,userID,date,ci,time)
        return jsonify(result), 200
    else:
        result = apply_disagree(id)
        return jsonify(result), 200
#查詢時間 by self
@app.route("/searchBySelf",methods=["POST"])
@jwt_required()
def Search_time():
    identity = get_jwt_identity()
    userID = identity["userID"]
    year = request.json.get("year",None)
    month = request.json.get("month",None)
    day = request.json.get("day",None)
    timeCondition = ""
    if day:
        timeCondition = str(year) + "-" + str(month) + "-" + str(day)
    else:
        timeCondition = str(year) + "-" + str(month)
    result = search_by_id(userID,timeCondition)
    timelist = [list(item) for item in result["ok"]]
    for i in timelist:
        if i[3]:
            i[3] = i[3].seconds
        if i[4]:
            i[4] = i[4].seconds
    return jsonify(timelist), 200  
#查詢時間 by Department
@app.route("/searchByDepartment",methods=["POST"])
@jwt_required()
@cross_origin()
def Search_By_Department():
    identity = get_jwt_identity()
    userID = identity["userID"]
    department = identity["department"]
    access = identity["access"]
    if access > 2:
        return {"no":"你沒資格使用這個搜尋"}
    name = request.json.get("name",None)
    account = request.json.get("account",None)
    year = request.json.get("year",None)
    month = request.json.get("month",None)
    day = request.json.get("day",None)
    timeCondition = ""
    if day:
        timeCondition = str(year) + "-" + str(month) + "-" + str(day)
    else:
        dt1 = datetime.now()
        dt2 = dt1.astimezone(timezone(timedelta(hours=8)))
        timeCondition = dt2.strftime("%Y-%m")
    #沒輸入
    if not name and not account and not timeCondition:
        return
    #只輸入時間
    if not name and not account:
        result = search_department_people(department,timeCondition) 
        timelist = [list(item) for item in result["ok"]]
        for i in timelist:
            if i[3]:
                i[3] = i[3].seconds
            if i[4]:
                i[4] = i[4].seconds
        return jsonify(timelist), 200   
    id = search_id(name,account,department) #先找被查詢者的id
    if type(id) != int:
        return jsonify(id), 200  
    result = search_by_id(id,timeCondition) #再做一次search by id
    timelist = [list(item) for item in result["ok"]]
    for i in timelist:
        if i[3]:
            i[3] = i[3].seconds
        if i[4]:
            i[4] = i[4].seconds
    return jsonify(timelist), 200  
#show my list
@app.route("/searchBySelf",methods=["GET"])
@jwt_required()
def Show_my_list():
    identity = get_jwt_identity()
    userID = identity["userID"]
    dt1 = datetime.now()
    dt2 = dt1.astimezone(timezone(timedelta(hours=8))) # 轉換時區 -> 東八區
    formatted_day = dt2.strftime("%Y-%m-%d")
    result = search_my_list(userID,formatted_day)
    if "ok" in result:
        timelist = list(result["ok"])
        if timelist[3]:
            timelist[3] = timelist[3].seconds
        if timelist[4]:
            timelist[4] = timelist[4].seconds
        return jsonify(timelist), 200  
    return jsonify(result), 200 
#Show list by Department
@app.route("/searchByDepartment",methods=["GET"])
@jwt_required()
def Show_By_Department():
    identity = get_jwt_identity()
    department = identity["department"]
    access = identity["access"]
    if access > 2:
        return {"no":"你沒資格使用這個搜尋"}
    dt1 = datetime.now()
    dt2 = dt1.astimezone(timezone(timedelta(hours=8))) # 轉換時區 -> 東八區
    formatted_day = dt2.strftime("%Y-%m-%d")
    result = search_department_people(department,formatted_day) 
    timelist = [list(item) for item in result["ok"]]
    for i in timelist:
        if i[3]:
            i[3] = i[3].seconds
        if i[4]:
            i[4] = i[4].seconds
    return jsonify(timelist), 200   
#search我的apply
@app.route("/searchApply",methods=["GET"])
@jwt_required()
def Search_my_apply():
    identity = get_jwt_identity()
    userID = identity["userID"]
    result = search_my_apply(userID)
    if "ok" not in result:
        return jsonify(result),200
    timelist = [list(item) for item in result["ok"]]
    for i in timelist:
        i[5] = i[5].seconds
    return jsonify({"ok":timelist}),200
#search部門的apply
@app.route("/searchApply",methods=["POST"])
@jwt_required()
def Search_department_apply():
    identity = get_jwt_identity()
    department = identity["department"]
    access = identity["access"]
    Sname = request.json.get("Sname",None)
    Saccount = request.json.get("Saccount",None)
    Sdate = request.json.get("Sdate",None)
    Stype = request.json.get("Stype",None)
    Sstate = request.json.get("Sstate",None)
    
    if access > 2:
        return {"no":"你沒資格使用這個搜尋"}
    result = search_department_apply(department,Sname,Saccount,Sdate,Stype,Sstate)
    if "ok" not in result:
        return jsonify(result),200
    timelist = [list(item) for item in result["ok"]]
    for i in timelist:
        if i[4]:
            i[4] = i[4].seconds
    return jsonify(timelist),200

#直接新增CICO
@app.route("/fixData",methods=["POST"])
@jwt_required()
def Push_data():
    identity = get_jwt_identity()
    access = identity["access"]
    if access > 1:
        return {"no":"你沒資格使用這個功能"}
    account = request.json.get("account",None)
    date = request.json.get("date",None)
    ci = request.json.get("ci",None)
    co = request.json.get("co",None)
    result = push_data(account,date,ci,co)
    return jsonify(result),200

#查詢篩選CICO
@app.route("/searchData",methods=["POST"])
@jwt_required()
def Search_data():
    identity = get_jwt_identity()
    access = identity["access"]
    if access > 1:
        return {"no":"你沒資格使用這個功能"}
    account = request.json.get("account",None)
    date = request.json.get("date",None)
    name = request.json.get("name",None)
    department = request.json.get("department",None)
    result = search_data(name,account,department,date)
    if "ok" in result:
        timelist = [list(item) for item in result["ok"]]
        for i in timelist:
            if i[3]:
                i[3] = i[3].seconds
            if i[4]:
                i[4] = i[4].seconds
        return jsonify({"ok":timelist}), 200   
    return jsonify(result),200
#直接修改CICO
@app.route("/fixData",methods=["PUT"])
@jwt_required()
def Fix_data():
    identity = get_jwt_identity()
    access = identity["access"]
    if access > 1:
        return {"no":"你沒資格使用這個功能"}
    id = request.json.get("id",None)
    ci = request.json.get("ci",None)
    co = request.json.get("co",None)
    if not id or not ci or not co:
        return {"no":"少參數"}
    result = fix_data(id,ci,co)
    return jsonify(result),200
#直接刪除CICO
@app.route("/fixData",methods=["DELETE"])
@jwt_required()
def Delete_data():
    identity = get_jwt_identity()
    access = identity["access"]
    if access > 1:
        return {"no":"你沒資格使用這個功能"}
    return




if __name__ == '__main__':
	app.run(debug=True, host='0.0.0.0')

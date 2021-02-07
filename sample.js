//管理用アプリNo.
var TO_APP_ID = xx;

//イベントハンドラ
kintone.events.on('app.record.create.submit.success', function(event) {
  connect_new_record(event);
});
kintone.events.on('app.record.index.edit.submit.success', function(event) {
  connect_edit_record(event);
});
kintone.events.on('app.record.edit.submit.success', function(event) {
  connect_edit_record(event);
});
kintone.events.on('app.record.index.delete.submit', function(event) {
  connect_delete_record(event);
});
kintone.events.on('app.record.detail.delete.submit', function(event) {
  connect_delete_record(event);
});


// レコード新規作成時の動作
function connect_new_record (event) {
  var record = event["record"];
  ["レコード番号", "更新者", "作成者", "更新日時", "作成日時", "$revision", "$id", "to_record_ID"].forEach(e => {delete record[e]});
  
  //登録側ゲストスペースアプリの参照URLを生成
  var url = kintone.api.url('/k/v1/record',true)
  url = url.substr(0,url.indexOf("/v1/"))
  record["from_URL"] = {"value":url + "/" + event["appId"] +"/show#record=" + event["recordId"]}

  var post_body = {
      'app': TO_APP_ID,
      'record': record
  };
  var put_body = {}

  return kintone.api(kintone.api.url('/k/v1/record'), 'POST', post_body).then(function(resp) {
      // 登録側ゲストスペースアプリのレコードに管理側アプリ側のIDの値を登録
      put_body = {
        'app' : event["appId"],
        'id' : event["recordId"],
        "record": {
          "to_record_ID" : {"value" : resp["id"]}
        },
      };
    }, 
    function(error) {
      alert("post-error:" + JSON.stringify(error));
    }).then(function() {
    return kintone.api(kintone.api.url('/k/v1/record', true), 'PUT', put_body).then(function(resp_2){
      alert("レコードの新規作成-接続完了");
    },
    function(error_2) {
      alert("put-error:" + JSON.stringify(error_2));
    });
  });
};

// レコード編集時の動作
// 登録側ゲストスペースアプリに登録された管理側アプリのレコードIDを使って、管理側アプリのレコードを更新する
function connect_edit_record (event) {
  var get_body = {
    "app" :event["appId"],
    "id"  :event["recordId"]
  };
  var put_body = {};
  return kintone.api(kintone.api.url('/k/v1/record', true), 'GET', get_body).then(function(resp){
    var record = resp["record"];
    var to_record_id = record["to_record_ID"]["value"];
    ["レコード番号", "更新者", "作成者", "更新日時", "作成日時", "$revision", "$id", "to_record_ID"].forEach(e => {delete record[e]});

    put_body = {
      'app' : TO_APP_ID,
      'id'  : to_record_id,
      'record': record
    };
    }).then(function() {
      return kintone.api(kintone.api.url('/k/v1/record'), 'PUT', put_body).then(function() {
        alert("レコードの更新-接続完了");
      },
      function(error_2) {
        alert("put-error:" + JSON.stringify(error_2));
      });
  });
};

// レコード削除時の動作
// 登録側ゲストスペースアプリに登録された管理側アプリのレコードIDを使って、管理側アプリのレコードを削除する
function connect_delete_record (event) {
  var delete_body = {
    "app" : TO_APP_ID,
    "ids" : [event["record"]["to_record_ID"]["value"]]
  };

  return kintone.api(kintone.api.url('/k/v1/records'), 'DELETE', delete_body).then(function(resp) {
    alert("レコードの削除-接続完了");
  },
  function(error) {
    alert("削除エラー" + JSON.stringify(error));
  });
}
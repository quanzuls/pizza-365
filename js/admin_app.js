/*** REGION 1 - Global variables - Vùng khai báo biến, hằng số, tham số TOÀN CỤC */
const gBASE_URL = "http://42.115.221.44:8080/devcamp-pizza365/orders";
const gNAME_COLS = [
  "orderId",
  "kichCo",
  "loaiPizza",
  "idLoaiNuocUong",
  "thanhTien",
  "hoTen",
  "soDienThoai",
  "trangThai",
  "action",
];
const gORDER_ID_COL = 0;
const gKICH_CO_COL = 1;
const gTYPE_PIZZA_COL = 2;
const gDRINK_COL = 3;
const gTOTAL_PRICE_COL = 4;
const gFULLNAME_COL = 5;
const gPHONE_COL = 6;
const gSTATUS_COL = 7;
const gACTION_COL = 8;
let gOrderObj;
let gOrderData;
const gSTATUS = {
  open: "open",
  confirmed: "confirmed",
  cancel: "cancel",
};
const gTYPE_PIZZA = {
  hawaii: "hawaii",
  bacon: "bacon",
  seafood: " seafood",
};
let gId_Order = "";
let gOrderId = "";
/*** REGION 2 - Vùng gán / thực thi hàm xử lý sự kiện cho các elements */
$(document).ready(() => {
  onPageLoading();

  $("#btn-filter-order").on("click", function () {
    onBtnFilterOrderClick();
  });
});
/*** REGION 3 - Event handlers - Vùng khai báo các hàm xử lý sự kiện */
function onPageLoading() {
  getAllOrder();
  loadDataStatusSelect(gSTATUS);
  loadDataTypePizzaSelect(gTYPE_PIZZA);
}

function onBtnDetailOrderClick(paramElement) {
  var vTable = $("#tbl-order").DataTable();
  let vRowClick = $(paramElement).closest("tr");
  let vRowData = vTable.row(vRowClick).data();

  gId_Order = vRowData.id;
  gOrderId = vRowData.orderId;
  console.log("ID: " + gId_Order);
  console.log("Order ID: " + gOrderId);

  $("#infor-order-modal").modal();
  loadDataOrderOnForm(vRowData, "#frm-infor-order");
}

// Lọc dữ liệu theo status / type pizza
function onBtnFilterOrderClick() {
  var vStatusObj = { status: "" };
  var vTypePizzaObj = { typePizza: "" };
  // Thu thập dữ liệu
  getDataFilter(vStatusObj, vTypePizzaObj);
  // Lọc dữ liệu
  var vData = [];
  vData = filterDataOrder(vStatusObj, vTypePizzaObj);
  // Load dữ liệu đã lọc
  loadDataOnTable(vData);
}

/*** REGION 4 - Common funtions - Vùng khai báo hàm dùng chung trong toàn bộ chương trình*/
function getAllOrder() {
  "use strict";
  $.ajax({
    url: gBASE_URL,
    type: "GET",
    dataType: "json",
    success: function (res) {
      gOrderData = res;
      contructorTable();
      loadDataOnTable(res);
      addEventListener();
    },
    error: function (ajaxContext) {
      alert(ajaxContext.responseText);
    },
  });
}

function contructorTable() {
  "use strict";
  gOrderObj = $("#tbl-order").DataTable({
    columns: [
      { data: gNAME_COLS[gORDER_ID_COL] },
      { data: gNAME_COLS[gKICH_CO_COL] },
      { data: gNAME_COLS[gTYPE_PIZZA_COL] },
      { data: gNAME_COLS[gDRINK_COL] },
      { data: gNAME_COLS[gTOTAL_PRICE_COL] },
      { data: gNAME_COLS[gFULLNAME_COL] },
      { data: gNAME_COLS[gPHONE_COL] },
      { data: gNAME_COLS[gSTATUS_COL] },
      { data: gNAME_COLS[gACTION_COL] },
    ],
    columnDefs: [
      {
        targets: gACTION_COL,
        defaultContent:
          '<button class="btn btn-success btn-detail" style="width: 100px;"><i class="fa-solid fa-circle-info"></i> Chi tiết</button>',
      },
    ],
  });
}

function loadDataOnTable(paramData) {
  "use strict";
  gOrderObj.clear();
  gOrderObj.rows.add(paramData);
  gOrderObj.draw();
}

function addEventListener() {
  $("#tbl-order").on("click", ".btn-detail", function () {
    onBtnDetailOrderClick(this);
  });
}

// Load dữ liệu status vào select
function loadDataStatusSelect(paramData) {
  "use strict";
  $("<option/>", {
    text: "--- Select status ---",
    value: 0,
  }).appendTo($("#select-status"));

  for (let bKey in paramData) {
    $("<option/>", {
      text: bKey,
      value: bKey,
    }).appendTo($("#select-status"));
  }
}
// Load dữ liệu type pizza vào select
function loadDataTypePizzaSelect(paramData) {
  "use strict";
  $("<option/>", {
    text: "--- Select type pizza ---",
    value: 0,
  }).appendTo($("#select-type-pizza"));
  for (let bKey in paramData) {
    $("<option/>", {
      text: bKey,
      value: bKey,
    }).appendTo($("#select-type-pizza"));
  }
}

// Thu thập dữ liệu
function getDataFilter(paramStatus, paramTypePizza) {
  "use strict";
  paramStatus.status = $("#select-status").val();
  paramTypePizza.typePizza = $("#select-type-pizza").val();
  console.log(paramStatus);
}
// Lọc dữ liệu
function filterDataOrder(paramStatus, paramTypePizza) {
  "use strict";
  var vResult = [];
  var vStatus = paramStatus.status;
  var vTypePizza = paramTypePizza.typePizza;

  if (vStatus !== "0" && vTypePizza === "0") {
    vResult = gOrderData.filter(function (paramStatus) {
      return paramStatus.trangThai === vStatus || vStatus === "0";
    });
  }
  if (vTypePizza !== "0" && vStatus === "0") {
    vResult = gOrderData.filter(function (paramPizzaType) {
      return paramPizzaType.loaiPizza === vTypePizza || vTypePizza === "0";
    });
  }

  for (let bKey of gOrderData) {
    if (bKey.trangThai === vStatus && bKey.loaiPizza === vTypePizza) {
      vResult.push(bKey);
    }
    if (vStatus === "0" && vTypePizza === "0") {
      vResult.push(bKey);
    }
  }
  return vResult;
}

function getElementInput(paramId) {
  var vArrInput = $(paramId).find("input");
  var vAttsInput = {};

  for (let bKey of vArrInput) {
    var bAtts = bKey.getAttributeNames().reduce((acc, name) => {
      return { ...acc, [name]: bKey.getAttribute(name) };
    }, {});
    vAttsInput[bAtts.name] = bAtts.id;
  }

  return vAttsInput;
}
// Load dữ liệu lên form thông tin chi tiết đơn hàng
function loadDataOrderOnForm(paramObjData, paramId) {
  "use strict";
  let vObjInputs = getElementInput(paramId);

  for (let bI in paramObjData) {
    for (let bJ in vObjInputs) {
      if (bI === bJ && (bI == "ngayTao" || bI == "ngayCapNhat")) {
        $(`#${vObjInputs[bJ]}`).val(
          moment(paramObjData[bI]).format("DD-MM-YYYY")
        );
      }
      if (bI === bJ && bI != "ngayTao" && bI != "ngayCapNhat") {
        $(`#${vObjInputs[bJ]}`).val(paramObjData[bI]);
      }
    }
  }
}
//Ham khi confirm don hang
function onBtnConfirmClick() {
  console.log(gId_Order);
  //B1 doc du lieu
  //B2 validate
  //B3 Xu ly API
  var objectRequest = {
    trangThai: "confirmed", //3 trang thai open, confirmed, cancel
  };
  $.ajax({
    async: false,
    url: "http://42.115.221.44:8080/devcamp-pizza365/orders/" + gId_Order,
    type: "PUT",
    contentType: "application/json;charset=UTF-8",
    data: JSON.stringify(objectRequest),
    success: function (res) {
      console.log(res);
      alert("Cập nhật thành công");
      $("#infor-order-modal").modal("hide");
      window.location.reload();
    },
  });
}
function onBtnCancelClick() {
  console.log(gId_Order);
  //B1 doc du lieu
  //B2 validate
  //B3 Xu ly API
  var objectRequest = {
    trangThai: "cancel", //3 trang thai open, confirmed, cancel
  };
  $.ajax({
    async: false,
    url: "http://42.115.221.44:8080/devcamp-pizza365/orders/" + gId_Order,
    type: "PUT",
    contentType: "application/json;charset=UTF-8",
    data: JSON.stringify(objectRequest),
    success: function (res) {
      console.log(res);
      alert("Cập nhật thành công");
      $("#infor-order-modal").modal("hide");
      window.location.reload();
    },
  });
}

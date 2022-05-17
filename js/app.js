"use strict";
/*** REGION 1 - Global variables - Vùng khai báo biến, hằng số, tham số TOÀN CỤC */
const gREQUEST_STATUS_OK = 200; // GET & PUT success
const gREQUEST_READY_STATUS_FINISH_AND_OK = 4;
const gREQUEST_CREATE_SUCCESS = 201;
// bạn có thể dùng để lưu trữ combo được chọn,
// mỗi khi khách chọn menu S, M, L bạn lại đổi giá trị properties của no
const gOrderObject = {
  kichCo: "",
  duongKinh: "",
  suon: "",
  salad: "",
  loaiPizza: "",
  idVourcher: "",
  idLoaiNuocUong: "",
  soLuongNuoc: "",
  hoTen: "",
  thanhTien: 0,
  email: "",
  soDienThoai: "",
  diaChi: "",
  loiNhan: "",
  giamGia: 0,
  maGiamGia: "",

  setSize(paramSize) {
    if (paramSize === "S") {
      this.kichCo = paramSize;
      this.duongKinh = "20";
      this.suon = "2";
      this.salad = "200";
      this.soLuongNuoc = "2";
      this.thanhTien = 150000;
    }
    if (paramSize === "M") {
      this.kichCo = paramSize;
      this.duongKinh = "25";
      this.suon = "4";
      this.salad = "300";
      this.soLuongNuoc = "3";
      this.thanhTien = 200000;
    }
    if (paramSize === "L") {
      this.kichCo = paramSize;
      this.duongKinh = "35";
      this.suon = "8";
      this.salad = "500";
      this.soLuongNuoc = "4";
      this.thanhTien = 250000;
    }
  },
  setType(paramType) {
    this.loaiPizza = paramType;
  },
};
/**REGION 2 */
$(document).ready(function () {
  loadDrinkList();
  $("#inp-email").on("input", validMail);
  $("#inp-dien-thoai").on("input", validPhone);
});
//Su kien click nut chon  pizza size
$(".btn-pizza").click(function () {
  $(".btn-pizza").removeClass("active");
  $(this).addClass("active");
  setPizzaSize(this);
});
//Su kien click nut chon  pizza type
$(".btn-pizza-type").click(function () {
  $(".btn-pizza-type").removeClass("active");
  $(this).addClass("active");
  setPizzaType(this);
});
//Su kien click nut kiem tra don
$("#btn-order").click(function () {
  onOrderPizza();
});
/** REGION 3 */
//ham click pizza size
function setPizzaSize(paramElement) {
  if ($(paramElement).attr("id") == "btn-pizza-small") {
    gOrderObject.setSize("S");
  }
  if ($(paramElement).attr("id") == "btn-pizza-medium") {
    gOrderObject.setSize("M");
  }
  if ($(paramElement).attr("id") == "btn-pizza-large") {
    gOrderObject.setSize("L");
  }
  console.log(gOrderObject);
}
//Ham click pizza type
function setPizzaType(paramElement) {
  if ($(paramElement).attr("id") == "btn-mania-type") {
    gOrderObject.setType("seafood");
  }
  if ($(paramElement).attr("id") == "btn-hawaii-type") {
    gOrderObject.setType("hawaii");
  }
  if ($(paramElement).attr("id") == "btn-bacon-type") {
    gOrderObject.setType("bacon");
  }
  console.log(gOrderObject);
}
//Ham load danh sach do uong
function loadDrinkList() {
  $.ajax({
    url: "http://42.115.221.44:8080/devcamp-pizza365/drinks",
    contentType: "json",
    type: "GET",
    success: function (res) {
      loadDrinkOption(res);
    },
  });
}
//Ham gan du lieu option vao select danh sach do uong
function loadDrinkOption(paramDrinkObj) {
  Array.from(paramDrinkObj).forEach((drink) => {
    $("#select-drink").append(
      `<option value='${drink.maNuocUong}'>${drink.tenNuocUong}</option>`
    );
  });
}

//Ham su ly khi khach hang bam nut kiem tra don
function onOrderPizza() {
  //Thu thap du lieu
  gOrderObject.hoTen = $.trim($("#inp-fullname").val());
  gOrderObject.email = $.trim($("#inp-email").val());
  gOrderObject.soDienThoai = $.trim($("#inp-dien-thoai").val());
  gOrderObject.diaChi = $.trim($("#inp-dia-chi").val());
  gOrderObject.maGiamGia = $.trim($("#inp-discount").val());
  gOrderObject.loiNhan = $.trim($("#inp-message").val());
  gOrderObject.idLoaiNuocUong = $("#select-drink").val();
  //Validate du lieu
  let isValid = validateData(gOrderObject);
  //Xu ly du lieu
  if (isValid) {
    showConfirmOrderModal();
  }
}
//Ham xu ly modal
function showConfirmOrderModal() {
  $("#modalConfirmOrder").modal("show");
  $("#modal-inp-fullname").val(gOrderObject.hoTen);
  $("#modal-inp-email").val(gOrderObject.email);
  $("#modal-inp-dien-thoai").val(gOrderObject.soDienThoai);
  $("#modal-inp-dia-chi").val(gOrderObject.diaChi);
  $("#modal-inp-discount").val(gOrderObject.maGiamGia);
  $("#modal-inp-message").val(gOrderObject.loiNhan);
  let vPizzaInfo = `Khách hàng: ${gOrderObject.hoTen}, ${
    gOrderObject.soDienThoai
  }, ${gOrderObject.diaChi}.
  Menu: Pizza ${gOrderObject.loaiPizza},size: ${gOrderObject.kichCo}, sườn: ${
    gOrderObject.suon
  },nước ngọt: ${gOrderObject.soLuongNuoc}, đồ uống: ${$(
    "#select-drink option:selected"
  ).text()}.
  Thanh toán: Giá ${gOrderObject.thanhTien}, Mã giảm giá: ${
    gOrderObject.maGiamGia
  }.
  Phải thanh toán: ${discountPrice(
    gOrderObject.thanhTien,
    checkDiscount(gOrderObject.maGiamGia)
  )} vnđ (giảm giá ${checkDiscount(gOrderObject.maGiamGia)} %)`;
  $("#modalTextPizzaInfo").val(vPizzaInfo);

  $("#modalConfirmOrder").click(function () {
    confirmOrder();
  });
}

//Hàm xử lý khi khách hàng nhấn confỉirm order
function confirmOrder() {
  $.ajax({
    async: false,
    url: "http://42.115.221.44:8080/devcamp-pizza365/orders",
    contentType: "application/json;charset=UTF-8",
    type: "POST",
    data: JSON.stringify(gOrderObject),
    success: function (res) {
      showThankModal(res.orderId);
    },
  });
}
//Ham goi modal cam on
function showThankModal(paramOrderId) {
  $("#modalConfirmOrder").modal("hide");
  $("#modalThanks").modal("show");
  $("#inpOrderId").val(paramOrderId);
}
/**REGION 4 */

//Ham validate du lieu
function validateData(paramOderObj) {
  if (paramOderObj.kichCo === "") {
    alert("Vui lòng chọn kích cỡ pizza");
    return false;
  }
  if (paramOderObj.loaiPizza === "") {
    alert("Vui lòng chọn loại pizza");
    return false;
  }
  if (paramOderObj.idLoaiNuocUong === "") {
    alert("Vui lòng chọn loại nước uống");
    return false;
  }
  if (paramOderObj.hoTen === "") {
    alert("Vui lòng nhập họ tên");
    return false;
  }
  if (paramOderObj.email === "") {
    alert("Vui lòng nhập email");
    return false;
  }
  if (paramOderObj.soDienThoai === "") {
    alert("Vui lòng nhập số điẹn thoại");
    return false;
  }

  if (paramOderObj.diaChi === "") {
    alert("Vui lòng nhập địa chỉ");
    return false;
  }
  return true;
}
//Ham valid email khi go chu
const validMail = () => {
  const $result = $("#result");
  const email = $("#inp-email").val();
  $result.text("");

  if (validateEmail(email)) {
    $result.text(email + " hợp lệ :)");
    $result.css("color", "green");
  } else {
    $result.text(email + " không hợp lệ :(");
    $result.css("color", "red");
  }
  return false;
};
function validateEmail(email) {
  return email.match(
    /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  );
}

//Ham valid phone khi go chu
const validPhone = () => {
  const $result = $("#result-phone");
  const phone = $("#inp-dien-thoai").val();
  $result.text("");

  if (validatePhone(phone)) {
    $result.text(phone + " hợp lệ :)");
    $result.css("color", "green");
  } else {
    $result.text(phone + " không hợp lệ :(");
    $result.css("color", "red");
  }
  return false;
};
function validatePhone(paramPhone) {
  if (isNaN(paramPhone) || paramPhone.length < 10 || paramPhone.length > 12) {
    return false;
  }
  return true;
}

//Funtion tính giá sau khi check discount
//input:
//paramPrice : giá ban đầu ( số nguyên )
//paramDiscountPercent: phần trăm giảm giá ( số nguyên )
//ouput : giá sau khi giảm ( số nguyên )
function discountPrice(paramPrice, paramDiscountPercent) {
  "use strict";
  var vLastPrice = -1;
  var vPercent = paramDiscountPercent / 100;
  vLastPrice = paramPrice - paramPrice * vPercent;
  return vLastPrice;
}

//Funtion kiểm tra mã giảm giá của khách hàng
//input : Chuỗi mã giảm giá
//ouput : giá trị phần trăm giảm giá ( số nguyên ) hoặc 0 (Không hợp lệ)
function checkDiscount(paramDiscountStr) {
  var vDiscountPercent = 0;
  $.ajax({
    async: false,
    url:
      "http://42.115.221.44:8080/devcamp-voucher-api/voucher_detail/" +
      paramDiscountStr,
    type: "GET",
    success: function (res) {
      vDiscountPercent = res.phanTramGiamGia;
    },
  });

  return vDiscountPercent;
}

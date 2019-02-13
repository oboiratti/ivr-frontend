export class Route {
    static login = "login" 
    static dashboard = "dashboard"
    static settings = "settings"
    static genericSettings = "settings/:model"
    static admin = "admin"
    static users = "users"
    static roles = "roles"

    static product = "product"
    static productForm = "product/form"
    static productFormEdit = "product/form/:id"
    static productDetails = "product/details/:id"
    static productDetailsView = "product/details"

    static profile = "profile"
    static profileForm = "profile-form"
    static changePassword = "change-password"

    static supplier = "supplier"
    static supplierForm = "supplier/form"
    static supplierFormEdit = "supplier/form/:id"

    static purchaseOrder = "purchase-order"
    static purchaseOrderForm = "purchase-order/form"
    static purchaseOrderFormEdit = "purchase-order/form/:id"
    static purchaseOrderDetails = "purchase-order/details/:id"
    static purchaseOrderDetailsView = "purchase-order/details"

    static purchase = "purchase"
    static purchaseForm = "purchase/form"
    static purchaseFormEdit = "purchase/form/:id"
    static purchaseDetails = "purchase/details/:id"
    static purchaseDetailsView = "purchase/details"

    static stock = "stock"

    static report = "report"


}
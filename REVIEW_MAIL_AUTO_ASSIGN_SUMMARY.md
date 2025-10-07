# 🤖 ReviewMail Auto-Assignment Implementation

## 🎯 Tính năng đã thêm

### **Auto-Assignment cho ReviewMail**
Mail trong ReviewMail bây giờ sẽ tự động được phân công giống như Valid Mail khi:
1. Mail được move vào ReviewMail (single mail)
2. Mail được move vào ReviewMail (batch move)
3. Chạy manual auto-assignment

## 🔧 Thay đổi trong mail-server/server.js

### **1. Thêm ReviewMail vào auto-assignment scope**
```javascript
// Line ~348: Cập nhật foldersToCheck
const foldersToCheck = [
  "DungHan/mustRep",
  "DungHan/rep", 
  "QuaHan/chuaRep",
  "QuaHan/daRep",
  "ReviewMail/pending",     // ✅ THÊM MỚI
  "ReviewMail/processed",   // ✅ THÊM MỚI
];
```

### **2. Tạo function auto-assign với format mới**
```javascript
// Line ~420: Function mới với format assignedTo hiện đại
const autoAssignMailWithModernFormat = (mailData, mailFilePath) => {
  // Sử dụng format assignedTo thay vì assigned_to
  // Tương thích với API assign-mail hiện tại
}
```

### **3. Thêm auto-assign vào API move-to-review**
```javascript
// Line ~3040: Trong API "/api/move-to-review"
if (writeJsonFile(reviewFilePath, reviewMailData)) {
  // Auto-assign the mail if possible
  const autoAssignResult = autoAssignMailWithModernFormat(reviewMailData, reviewFilePath);
  if (autoAssignResult.success) {
    reviewMailData = autoAssignResult.updatedMail;
  }
  // ... rest of code
}
```

### **4. Thêm auto-assign vào API move-selected-to-review**
```javascript  
// Line ~3750: Trong API "/api/move-selected-to-review"
if (writeJsonFile(reviewFilePath, reviewMailData)) {
  // Auto-assign the mail if possible (batch)
  const autoAssignResult = autoAssignMailWithModernFormat(reviewMailData, reviewFilePath);
  if (autoAssignResult.success) {
    reviewMailData = autoAssignResult.updatedMail;
  }
  // ... rest of code
}
```

### **5. Kích hoạt API trigger-auto-assign**
```javascript
// Line ~2723: Enable manual auto-assignment
app.post("/api/trigger-auto-assign", (req, res) => {
  const result = autoAssignAllUnassignedMails(); // ✅ Kích hoạt lại
  res.json({
    success: true,
    assignedCount: result.assignedCount,
    totalChecked: result.totalChecked,
    results: result.results
  });
});
```

### **6. Cập nhật logic mixed format**
```javascript
// Line ~375: Hỗ trợ cả format cũ và mới
if (mailData && !mailData.assignedTo && !mailData.assigned_to) {
  let result;
  if (folder.startsWith('ReviewMail/')) {
    result = autoAssignMailWithModernFormat(mailData, filePath); // Format mới
  } else {
    result = autoAssignMailToLeaderPIC(mailData, filePath);      // Format cũ
  }
}
```

## 🎯 Cách hoạt động

### **Khi nào auto-assign được trigger:**

1. **Single mail move to review:**
   - User click "Move to Review" trên 1 mail
   - Mail được move vào `ReviewMail/pending` hoặc `ReviewMail/processed`
   - Auto-assign chạy ngay lập tức

2. **Batch mail move to review:**
   - User select nhiều mail và click "Move Selected to Review"
   - Mỗi mail được move và auto-assign individual

3. **Manual trigger:**
   - API call: `POST /api/trigger-auto-assign`
   - Scan tất cả mail unassigned trong ReviewMail folders
   - Thực hiện auto-assign hàng loạt

### **Logic auto-assignment:**

1. **Lấy sender email** từ `mail.From` hoặc `mail.EncryptedFrom`
2. **Extract domain** từ email (ví dụ: @company.com)
3. **Tìm group** có member matching:
   - Exact email: `user@company.com`
   - Domain wildcard: `*.company.com`
   - Partial domain match
4. **Tìm PIC** được assign cho group đó
5. **Tạo assignment** với format mới:
   ```json
   {
     "assignedTo": {
       "type": "pic",
       "groupId": "group-123",
       "picId": "pic-456", 
       "groupName": "IT Department",
       "picName": "John Smith",
       "picEmail": "john@company.com",
       "assignedAt": "2025-01-15T14:30:00.000Z",
       "auto_assigned": true,
       "assignment_reason": "Auto-assigned based on sender domain: company.com"
     }
   }
   ```

## 🧪 Testing

### **Script test:** `test-review-auto-assign.js`

**Tạo test scenario:**
1. Tạo test group với members: `test@company.com`, `*.company.com`
2. Tạo test PIC cho group
3. Tạo 3 test mail:
   - Mail từ `test@company.com` (exact match) ✅
   - Mail từ `someone@company.com` (wildcard match) ✅  
   - Mail từ `other@otherdomain.com` (no match) ❌
4. Call API trigger auto-assign
5. Verify kết quả

**Chạy test:**
```bash
node test-review-auto-assign.js
```

## 🚀 Cách sử dụng

### **1. Auto khi move mail:**
- Vào Review Mails page
- Click "Move to Review" trên bất kỳ mail nào
- Mail sẽ được auto-assign nếu sender match với group

### **2. Manual trigger cho tất cả mail:**
```bash
# API call
curl -X POST http://localhost:3002/api/trigger-auto-assign

# Hoặc từ frontend có thể add button để call API này
```

### **3. Kiểm tra assignment:**
- Vào Review Mails page
- Mail đã assigned sẽ hiển thị PIC name và group
- Filter by assigned status

## 📊 Format so sánh

### **Old format** (Valid Mail):
```json
{
  "assigned_to": "John Smith",
  "assigned_email": "john@company.com", 
  "auto_assigned": true
}
```

### **New format** (Review Mail):
```json
{
  "assignedTo": {
    "type": "pic",
    "picId": "pic-123",
    "picName": "John Smith",
    "picEmail": "john@company.com",
    "groupId": "group-456", 
    "groupName": "IT Department",
    "assignedAt": "2025-01-15T14:30:00.000Z",
    "auto_assigned": true,
    "assignment_reason": "Auto-assigned based on sender domain: company.com"
  }
}
```

## ✅ Kết quả

**ReviewMail bây giờ có đầy đủ tính năng auto-assignment giống Valid Mail:**

✅ **Auto-assign khi move single mail**  
✅ **Auto-assign khi move batch mail**  
✅ **Manual trigger auto-assign API**  
✅ **Hỗ trợ exact email match**  
✅ **Hỗ trợ domain wildcard match**  
✅ **Format assignedTo hiện đại**  
✅ **Logging chi tiết**  
✅ **Error handling graceful**  

**Auto-assignment trong ReviewMail hoạt động hoàn toàn tương tự như Valid Mail!** 🎉
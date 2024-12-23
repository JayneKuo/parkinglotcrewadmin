

## **1. 功能模块概览**  

1. **数据统计与页面刷新功能**  
2. **车位列表展示与实时状态管理**  
3. **车位状态分类及对应操作**  
   - 可用状态（Available）  
   - 已占用状态（Occupied）  
   - 预定状态（Reserved）  
   - 锁定状态（Locked）  
4. **操作校验规则与异常处理**  

---

## **2. 功能模块 1：数据统计与页面刷新功能**

### **2.1 功能描述**  
提供停车场 **实时统计数据**，包括 **车位总数** 及各类状态车位数量，支持 **手动刷新** 和 **自动定时刷新**，确保页面数据与后台实时同步。  

---

### **2.2 数据统计功能**

#### **统计维度**  
1. **总车位数（Total Spots）**  
2. **可用车位数（Available Spots）**  
3. **已占用车位数（Occupied Spots）**  
4. **已预定车位数（Reserved Spots）**  
5. **已锁定车位数（Locked Spots）**  

#### **数据计算逻辑**  
- **总车位数**：  
   ```plaintext
   Total Spots = Count(所有车位)
   ```  
- **各状态车位数量**：  
   ```plaintext
   Available Spots = Count(车位状态 == Available)
   Occupied Spots = Count(车位状态 == Occupied)
   Reserved Spots = Count(车位状态 == Reserved)
   Locked Spots = Count(车位状态 == Locked)
   ```  

---

### **2.3 页面刷新功能**

#### **手动刷新**  
1. **触发条件**：管理员点击 **“Refresh”** 按钮。  
2. **操作流程**：  
   1. 系统发送后台数据请求。  
   2. 获取最新统计数据和车位状态数据。  
   3. 更新页面展示内容。  
3. **反馈提示**：  
   - 成功："数据已刷新。"  
   - 失败："数据刷新失败，请稍后重试。"  

---

#### **自动定时刷新**  
1. **触发条件**：页面加载完成后，系统每 **5 秒** 自动刷新。  
2. **操作流程**：  
   - 系统定时发送请求。  
   - 成功 → 页面数据更新。  
   - 失败 → 提示异常，系统自动重试。  
3. **异常处理**：  
   - 网络异常：“网络异常，请检查网络连接。”  
   - 数据加载失败：“自动刷新失败，正在尝试重新同步数据...”  

---

### **2.4 数据展示规则**

1. **展示位置**：页面顶部，卡片式布局。  
2. **颜色区分**：  
   - 总车位数：蓝色  
   - 可用车位数：绿色  
   - 已占用车位数：红色  
   - 已预定车位数：橙色  
   - 已锁定车位数：灰色  

---

## **3. 功能模块 2：车位列表展示与实时状态管理**

### **3.1 功能描述**  
系统按 **区域分组** 和 **状态排序** 展示车位信息，提供各状态下的实时信息与对应操作，便于管理员高效管理车位资源。

---

### **3.2 区域分组与排序规则**  
1. **区域分组**：车位根据所属区域（如 Zone A、Zone B）展示。  
2. **状态优先排序**：**Occupied → Reserved → Available → Locked**  
3. **编号排序**：车位编号升序排列（如 A-1 → A-2 → A-3）。  

---

## **4. 车位状态分类及对应操作**

### **4.1 可用状态（Available）**

#### **展示内容**  
- 车位编号：如 **A-1**  
- 状态标签：**“Available”**  

#### **操作功能**  

1. **车辆入场（+Entry）**  
   - **功能**：录入车辆车牌号，车位状态更新为 **Occupied**。  
   - **校验逻辑**：  
     - 车牌号不能为空，且符合格式标准。  
     - 校验当前车位是否存在未开始的预定，若存在提示冲突。  
   - **操作流程**：  
     1. 点击 **“+Entry”** → 输入车牌号 → 校验。  
     2. 校验通过 → 状态更新为 **Occupied**，开始停留时长计时。  
     3. 页面显示车牌号与停留时长。  

2. **锁定车位（Lock）**  
   - **功能**：手动锁定车位，状态更新为 **Locked**。  
   - **校验逻辑**：  
     - 仅可对 **Available** 状态车位执行锁定操作。  
   - **操作流程**：  
     1. 点击 **“Lock”** → 确认操作 → 状态更新为 **Locked**。  

3. **查看车位详情（View）**  
   - **功能**：查看当前车位的基础信息与状态。  

---

### **4.2 已占用状态（Occupied）**

#### **展示内容**  
- 车牌号：如 **ABC1234**  
- 停留时长：如 **4h 30m**  
- 超时提示：超时标红显示 **“Overtime 1h 30m”**。  

#### **操作功能**  

1. **车辆离场（Exit）**  
   - **功能**：释放车位，清除车辆信息。  
   - **校验逻辑**：  
     - 判断车辆是否超时，弹出超时费用支付确认窗口。  
   - **操作流程**：  
     1. 点击 **“Exit”** → 系统校验是否超时。  
     2. **超时** → 弹出支付窗口 → 支付完成或放弃付款 → 状态更新为 **Available**。  
     3. **未超时** → 直接释放车位，状态更新为 **Available**。  

2. **车位转移（Transfer）**  
   - **功能**：将车辆移至其他可用车位。  
   - **校验逻辑**：  
     - 目标车位必须为 **Available** 状态。  

3. **查看车辆信息（View）**  
   - **功能**：查看车牌号、入场时间、停留时长、超时状态。  

---

### **4.3 预定状态（Reserved）**

#### **展示内容**  
- 最近预定时间段：如 **14:00 - 16:00**  
- 预定人信息：如 **张三（138xxxx5678）**  

#### **操作功能**  

1. **车辆入场（+Entry）**  
   - **功能**：录入车辆信息，将车位更新为 **Occupied**。  
   - **校验逻辑**：  
     - 输入车牌号必须与预定记录匹配。  
   - **操作流程**：  
     1. 点击 **“+Entry”** → 输入车牌号 → 校验匹配预定记录。  
     2. 校验通过 → 状态更新为 **Occupied**，开始停留计时。  

2. **取消预定（Cancel Reservation）**  
   - **功能**：释放车位资源，更新状态为 **Available**。  

3. **查看预定记录（View Reservations）**  
   - **功能**：查看所有预定信息，包括时间段与状态。  

---

### **4.4 锁定状态（Locked）**

#### **展示内容**  
- 车位编号与状态标签：**“Locked”**  

#### **操作功能**  

1. **解锁车位（Unlock）**  
   - **功能**：将车位状态恢复为 **Available**。  

2. **查看车位详情（View）**  
   - **功能**：查看当前车位的基础信息与更新时间。  

---

## **5. 操作校验规则与异常处理**

1. **状态校验**：确保操作在正确的状态下执行。  
2. **输入校验**：车牌号必填，格式正确，预定状态下需匹配记录。  
3. **超时校验**：车辆离场时校验超时时长，弹出费用处理窗口。  
4. **异常处理**：  
   - 数据加载失败 → 提示重试。  
   - 网络异常 → 提示检查网络连接。  
   - 操作失败 → 提示稍后重试。

---

### **所有提示信息（中英文）**

---

## **1. 数据统计与页面刷新提示**

### **手动刷新**  
- **成功**：  
   - **中文**：“数据已刷新。”  
   - **英文**：“Data successfully refreshed.”  
- **失败**：  
   - **中文**：“数据刷新失败，请稍后重试。”  
   - **英文**：“Data refresh failed. Please try again later.”  

### **自动定时刷新**  
- **失败**：  
   - **中文**：“自动刷新失败，正在尝试重新同步数据...”  
   - **英文**：“Auto refresh failed. Attempting data resync...”  

---

## **2. 可用状态（Available）**

### **车辆入场（+Entry）**  
- **成功**：  
   - **中文**：“车辆入场成功，车位已占用。”  
   - **英文**：“Vehicle entry successful. Parking spot is now occupied.”  
- **失败（车位存在预定冲突）**：  
   - **中文**：“车位存在未开始的预定，无法入场。”  
   - **英文**：“A reservation exists for this spot. Vehicle entry not allowed.”  
- **失败（车牌号格式错误）**：  
   - **中文**：“请输入正确的车牌号。”  
   - **英文**：“Please enter a valid license plate number.”

### **锁定车位（Lock）**  
- **成功**：  
   - **中文**：“车位已成功锁定。”  
   - **英文**：“Parking spot successfully locked.”  
- **失败**：  
   - **中文**：“车位锁定失败，请稍后重试。”  
   - **英文**：“Failed to lock the parking spot. Please try again later.”

---

## **3. 已占用状态（Occupied）**

### **车辆离场（Exit）**  
- **未超时，离场成功**：  
   - **中文**：“车辆离场成功，车位已释放。”  
   - **英文**：“Vehicle exit successful. Parking spot is now available.”  
- **超时，支付成功**：  
   - **中文**：“超时费用已支付，车辆离场成功。”  
   - **英文**：“Overtime fee paid. Vehicle exit successful.”  
- **超时，未支付（强制释放）**：  
   - **中文**：“车位已释放，超时费用未支付，请后续处理。”  
   - **英文**：“Parking spot released. Overtime fee unpaid. Follow up required.”  
- **操作失败**：  
   - **中文**：“车辆离场失败，请稍后重试。”  
   - **英文**：“Vehicle exit failed. Please try again later.”

### **车位转移（Transfer）**  
- **成功**：  
   - **中文**：“车辆已成功转移至车位 {目标车位编号}。”  
   - **英文**：“Vehicle successfully transferred to parking spot {Target Spot ID}.”  
- **失败**：  
   - **中文**：“车位转移失败，请稍后重试。”  
   - **英文**：“Vehicle transfer failed. Please try again later.”  

### **查看车辆信息（View）**  
- **成功**：  
   - **中文**：“车辆信息已加载。”  
   - **英文**：“Vehicle information loaded successfully.”  
- **失败**：  
   - **中文**：“车辆信息加载失败，请稍后重试。”  
   - **英文**：“Failed to load vehicle information. Please try again later.”

---

## **4. 预定状态（Reserved）**

### **车辆入场（+Entry）**  
- **成功**：  
   - **中文**：“车辆入场成功，车位已占用。”  
   - **英文**：“Vehicle entry successful. Parking spot is now occupied.”  
- **失败（车牌号不匹配）**：  
   - **中文**：“输入的车牌号与预定记录不匹配，请核对信息。”  
   - **英文**：“The entered license plate does not match the reservation record. Please check the details.”  
- **失败（车牌号格式错误）**：  
   - **中文**：“请输入正确的车牌号。”  
   - **英文**：“Please enter a valid license plate number.”

### **取消预定（Cancel Reservation）**  
- **成功**：  
   - **中文**：“预定已取消，车位已释放。”  
   - **英文**：“Reservation cancelled. Parking spot is now available.”  
- **失败**：  
   - **中文**：“取消预定失败，请稍后重试。”  
   - **英文**：“Failed to cancel the reservation. Please try again later.”  

### **查看预定记录（View Reservations）**  
- **成功**：  
   - **中文**：“预定记录已加载。”  
   - **英文**：“Reservation records loaded successfully.”  
- **失败**：  
   - **中文**：“预定记录加载失败，请稍后重试。”  
   - **英文**：“Failed to load reservation records. Please try again later.”  

---

## **5. 锁定状态（Locked）**

### **解锁车位（Unlock）**  
- **成功**：  
   - **中文**：“车位已成功解锁，可正常使用。”  
   - **英文**：“Parking spot successfully unlocked and is now available.”  
- **失败**：  
   - **中文**：“车位解锁失败，请稍后重试。”  
   - **英文**：“Failed to unlock the parking spot. Please try again later.”

### **查看车位详情（View）**  
- **成功**：  
   - **中文**：“车位详情已加载。”  
   - **英文**：“Parking spot details loaded successfully.”  
- **失败**：  
   - **中文**：“车位详情加载失败，请稍后重试。”  
   - **英文**：“Failed to load parking spot details. Please try again later.”

---

## **6. 通用异常提示**

1. **网络异常**：  
   - **中文**：“网络异常，请检查网络连接。”  
   - **英文**：“Network error. Please check your connection.”  

2. **数据加载失败**：  
   - **中文**：“数据加载失败，请刷新页面重试。”  
   - **英文**：“Data loading failed. Please refresh the page and try again.”  

3. **操作失败**：  
   - **中文**：“操作失败，请稍后重试。”  
   - **英文**：“Operation failed. Please try again later.”

4. **状态校验失败**：  
   - **中文**：“当前车位状态不允许此操作。”  
   - **英文**：“This operation is not allowed in the current parking spot state.”  

---

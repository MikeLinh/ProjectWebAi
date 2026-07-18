package com.source.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "warehouse_receipts")
public class WarehouseReceipt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "receipt_id")
    private Long receiptId;

    @Column(name = "admin_id")
    private Long adminId;

    @Column(name = "product_id")
    private Long productId;

    @Column(name = "quantity_added")
    private Integer quantityAdded;

    @Column(name = "import_price", precision = 15, scale = 2)
    private BigDecimal importPrice;

    @Column(name = "imported_at")
    private LocalDateTime importedAt;
    
    @ManyToOne
    @JoinColumn(name="supplier_id")
    private Supplier supplier;

    @ManyToOne
    @JoinColumn(name="manufacturer_id")
    private Manufacturer manufacturer;

   
    @Transient
    private String productName;

    public Long getReceiptId()                      { return receiptId; }
    public void setReceiptId(Long receiptId)        { this.receiptId = receiptId; }

    public Long getAdminId()                        { return adminId; }
    public void setAdminId(Long adminId)            { this.adminId = adminId; }

    public Long getProductId()                      { return productId; }
    public void setProductId(Long productId)        { this.productId = productId; }

    public Integer getQuantityAdded()               { return quantityAdded; }
    public void setQuantityAdded(Integer q)         { this.quantityAdded = q; }

    public BigDecimal getImportPrice()              { return importPrice; }
    public void setImportPrice(BigDecimal p)        { this.importPrice = p; }

    public LocalDateTime getImportedAt()            { return importedAt; }
    public void setImportedAt(LocalDateTime t)      { this.importedAt = t; }

    public String getProductName()                  { return productName; }
    public void setProductName(String n)            { this.productName = n; }

    public Supplier getSupplier()                   { return supplier; }
    public void setSupplier(Supplier s)             { this.supplier = s; }

    public Manufacturer getManufacturer()           { return manufacturer; }
    public void setManufacturer(Manufacturer m)     { this.manufacturer = m; }

    @Transient
    public String getSupplierName() {
        return this.supplier != null ? this.supplier.getSupplierName() : null; 
    }

    @Transient
    public String getManufacturerName() {
        return this.manufacturer != null ? this.manufacturer.getManufacturerName() : null; 
    }
}
import {
  useAddProduct,
  useUpdateProductsListed,
  useVendorProducts,
  useUpdateProduct,
} from "@/hooks/auth/vendor";
import styles from "./ProductManagement.module.scss";
// import { products } from "@/types/data/product";
import type { Product } from "@/types/store";
import React from "react";
import { useCloudinaryUpload } from "@/hooks/utils/cloudinary";
import {
  ProductModal,
  type ProductModalRef,
} from "@/components/molecules/ProductModal";
import {
  ProductEditModal,
  type ProductEditModalRef,
  type ProductEditFormData,
} from "@/components/molecules/ProductEditModal";
import BlockModal from "@/components/atoms/BlockModal/BlockModal";

export default function ProductTab() {
  const cloudinaryUploadMutation = useCloudinaryUpload();
  const addProductMutation = useAddProduct();
  const vendorProductsQuery = useVendorProducts();
  const updateProductsMutation = useUpdateProductsListed();
  const updateProductMutation = useUpdateProduct();

  const [products, setProducts] = React.useState<Product[]>([]);
  const modalRef = React.useRef<ProductModalRef>(null);
  const editModalRef = React.useRef<ProductEditModalRef>(null);

  React.useEffect(() => {
    if (vendorProductsQuery.isSuccess) {
      setProducts(vendorProductsQuery.data);
      console.log(vendorProductsQuery.data);
    }
  }, [vendorProductsQuery.data, vendorProductsQuery.isSuccess]);

  const [form, setForm] = React.useState({
    name: "長島冰茶",
    price: 999,
    desc: "長島的茶茶茶茶茶茶茶茶茶茶茶茶茶茶茶茶茶茶",
    options: { size: "大,小", sugar: "半糖,微糖", ice: "去冰,微冰" },
    url: "https://imgs.gvm.com.tw/upload/gallery/20180227/43031_01.jpg",
  });

  const toggleListed = (id: number) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, is_listed: !p.is_listed } : p))
    );
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    cloudinaryUploadMutation.mutate(file, {
      onSuccess: (data) => {
        console.log("Uploaded URL:", data.secure_url);
        setForm((f) => ({ ...f, url: data.secure_url }));
      },
    });
  };

  const handleAddProduct = () => {
    console.log(form);

    addProductMutation.mutate({
      name: form.name,
      price: form.price,
      description: form.desc,
      options: {
        size: form.options.size,
        ice: form.options.ice,
        sugar: form.options.sugar,
      },
      image_url: form.url,
    });
  };

  const handleUpdateSave = () => {
    updateProductsMutation.mutate(
      products.map((p) => ({
        product_id: p.id,
        is_listed: p.is_listed,
      }))
    );
  };

  const handleEditProduct = async (
    productId: number,
    formData: ProductEditFormData
  ) => {
    await updateProductMutation.mutateAsync({
      product_id: productId,
      name: formData.name,
      price: formData.price,
      description: formData.description,
      image_url: formData.image_url,
      size: formData.size,
      sugar: formData.sugar,
      ice: formData.ice,
      price_step: formData.price_step,
    });
  };
  const handleEditUpload = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      cloudinaryUploadMutation.mutate(file, {
        onSuccess: (data) => {
          resolve(data.secure_url);
        },
        onError: (error) => {
          reject(error);
        },
      });
    });
  };

  return (
    <section className={styles["container"]}>
      <BlockModal />
      <ProductModal
        ref={modalRef}
        submitText="關閉預覽"
        onSubmit={async () => {
          modalRef.current?.close();
        }}
        needFetch={false}
      />
      <ProductEditModal
        ref={editModalRef}
        onSubmit={handleEditProduct}
        onUpload={handleEditUpload}
      />

      <div className={styles["info"]}>
        <header>商品資訊</header>
        <div className={styles["content"]}>
          <div style={{ flex: 1 }}>
            <h4 className={styles["table-title"]}>上架專區</h4>
            <ProductTable
              products={products.filter((p) => p.is_listed)}
              onToggle={toggleListed}
              onOpenModal={(product) => modalRef.current?.open(product)}
              onEdit={(product) => editModalRef.current?.open(product)}
            />
          </div>
          <div style={{ flex: 1 }}>
            <h4 className={styles["table-title"]}>下架專區</h4>
            <ProductTable
              products={products.filter((p) => !p.is_listed)}
              onToggle={toggleListed}
              onOpenModal={(product) => modalRef.current?.open(product)}
              onEdit={(product) => editModalRef.current?.open(product)}
            />
          </div>
        </div>
        <footer>
          <button onClick={handleUpdateSave}>
            {updateProductsMutation.isPending ? "處理中" : "儲存"}
          </button>
        </footer>
      </div>
      <div className={styles["add"]}>
        <header>新增商品</header>
        <div className={styles["content"]}>
          <div>
            <label>商品名稱</label>
            <input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
          </div>
          <div>
            <label>商品價格</label>
            <input
              value={form.price}
              onChange={(e) =>
                setForm((f) => ({ ...f, price: Number(e.target.value) }))
              }
            />
          </div>
          <div>
            <label>商品描述</label>
            <input
              value={form.desc}
              onChange={(e) => setForm((f) => ({ ...f, desc: e.target.value }))}
            />
          </div>
          <div>
            <label>大小種類</label>
            <input
              value={form.options.size}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  options: { ...f.options, size: e.target.value },
                }))
              }
            />
          </div>
          <div>
            <label>甜度種類</label>
            <input
              value={form.options.sugar}
              placeholder="微冰,去冰"
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  options: { ...f.options, sugar: e.target.value },
                }))
              }
            />
          </div>
          <div>
            <label>冰度種類</label>
            <input
              value={form.options.ice}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  options: { ...f.options, ice: e.target.value },
                }))
              }
            />
          </div>
          <div>
            <input type="file" onChange={handleUpload} />
          </div>
        </div>
        <footer>
          <button
            onClick={handleAddProduct}
            disabled={
              addProductMutation.isPending || cloudinaryUploadMutation.isPending
            }
          >
            {addProductMutation.isPending || cloudinaryUploadMutation.isPending
              ? "處理中"
              : "確認新增"}
          </button>
        </footer>
      </div>
    </section>
  );
}

function ProductTable({
  products,
  onToggle,
  onOpenModal,
  onEdit,
}: {
  products: Product[];
  onToggle: (id: number) => void;
  onOpenModal: (product: Product) => void;
  onEdit: (product: Product) => void;
}) {
  return (
    <div className={styles["table-wrapper"]}>
      <table>
        <thead>
          <tr>
            <th>名稱</th>
            <th style={{ width: "90px" }}>上/下架</th>
            <th style={{ width: "90px" }}>編輯</th>
            <th style={{ width: "90px" }}>預覽</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id}>
              <td>{p.name}</td>
              <td style={{ width: "90px" }}>
                <button onClick={() => onToggle(p.id)}>
                  {p.is_listed ? "下架" : "上架"}
                </button>
              </td>
              <td style={{ width: "90px" }}>
                <button onClick={() => onEdit(p)}>編輯</button>
              </td>
              <td style={{ width: "90px" }}>
                <button onClick={() => onOpenModal(p)}>預覽</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

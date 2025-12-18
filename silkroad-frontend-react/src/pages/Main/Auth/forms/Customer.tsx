
import LabeledInput from "@/components/molecules/LabeledInput";
import styles from "./Form.module.scss"
import { useState } from "react";

export const CustomerForm = () => {
    const [customerForm, setCustomerForm] = useState({
        name: "Customer",
        address: "123 Street",
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Customer Info:", customerForm);
    }

    return (
        <form className={styles['form']} onSubmit={handleSubmit}>
            <div style={{ display: 'flex', gap: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignContent: 'center' }}>
                    <h2 className={styles['title']}>顧客資料</h2>
                    <LabeledInput
                        label="Name"
                        value={customerForm.name}
                        onChange={(value) => setCustomerForm({ ...customerForm, name: value })}
                    />
                    <LabeledInput
                        label="Address"
                        value={customerForm.address}
                        onChange={(value) => setCustomerForm({ ...customerForm, address: value })}
                    />
                    <button
                        type="submit"
                        className={styles['button']}
                    // disabled={registerMutation.isPending}
                    >
                        確認
                        {/* {registerMutation.isPending ? "處理中" : "註冊"} */}
                    </button>
                </div>
            </div>
        </form>
    );
}
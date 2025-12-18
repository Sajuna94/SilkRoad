
import LabeledInput from "@/components/molecules/LabeledInput";
import styles from "./Form.module.scss"
import { useState } from "react";
import { useRegisterRole } from "@/hooks/auth/user";
import { UserRole } from "@/types/user";

export const VendorForm = () => {
    const [managerForm, setManagerForm] = useState({
        name: "Manager",
        email: "manager@example.com",
        phone: "123",
    });
    const [vendorForm, setVendorForm] = useState({
        name: "Vendor",
        address: "123 Street",
    });

    const registerMutation = useRegisterRole(UserRole.VENDOR);
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Vendor Info:", vendorForm);
        console.log("Manager Info:", managerForm);

        registerMutation.mutate({
            manager: {
                name: managerForm.name,
                email: managerForm.email,
                phone_number: managerForm.phone,
            },
            vendor: {
                name: vendorForm.name,
                address: vendorForm.address,
            },
        }, {
            onSuccess: (user) => {
                console.log("註冊成功:", user);
            },
        });
    }

    return (
        <form className={styles['form']} onSubmit={handleSubmit}>
            <div style={{ display: 'flex', gap: '30px' }}>
                <div>
                    <h2 className={styles['title']}>管理人資訊</h2>
                    <LabeledInput
                        label="Name"
                        value={managerForm.name}
                        onChange={(value) => setManagerForm({ ...managerForm, name: value })}
                    />
                    <LabeledInput
                        label="Email"
                        value={managerForm.email}
                        onChange={(value) => setManagerForm({ ...managerForm, email: value })}
                    />
                    <LabeledInput
                        label="Phone"
                        value={managerForm.phone}
                        onChange={(value) => setManagerForm({ ...managerForm, phone: value })}
                    />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignContent: 'center' }}>
                    <h2 className={styles['title']}>店家資料</h2>
                    <LabeledInput
                        label="Name"
                        value={vendorForm.name}
                        onChange={(value) => setVendorForm({ ...vendorForm, name: value })}
                    />
                    <LabeledInput
                        label="Address"
                        value={vendorForm.address}
                        onChange={(value) => setVendorForm({ ...vendorForm, address: value })}
                    />
                    <button
                        type="submit"
                        className={styles['button']}
                        disabled={registerMutation.isPending}
                    >
                        {registerMutation.isPending ? "處理中" : "註冊"}
                    </button>
                </div>
            </div>
        </form>
    );
}
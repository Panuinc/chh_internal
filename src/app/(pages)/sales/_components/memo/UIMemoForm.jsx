"use client";
import React from "react";
import { Button, Input, Textarea } from "@heroui/react";
import { Save } from "lucide-react";
import Image from "next/image";

export default function UIMemoForm({
  formHandler,
  mode,
  isUpdate,
  operatedBy,
}) {
  const { formRef, formData, handleChange, handleSubmit, errors } = formHandler;

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="flex flex-col items-center justify-start w-full xl:w-8/12 h-full gap-2 border-l-2 border-r-2 border-default overflow-auto"
    >
      <div className="flex flex-col xl:flex-row items-center justify-center w-full h-fit p-2 gap-2">
        <div className="flex items-center justify-center min-w-40 h-full p-2 gap-2">
          <Image src="/logo/logo-02.png" alt="logo" width={150} height={150} />
        </div>
        <div className="flex flex-col items-center justify-center w-full h-full">
          <div className="flex items-center justify-start w-full h-full p-2 gap-2 text-lg font-black">
            C.H.H. INDUSTRY CO., LTD.
          </div>
          <div className="flex items-center justify-start w-full h-full p-2 gap-2">
            9/1 Moo.2 Banglen-Lardloomkeaw rd, T.Khunsri A.Sainoi Nonthaburi
            11150 Tel: (66) 02-921-9979-80 Fax: 02-921-9978 WWW.CHHTHAILAND.COM
          </div>
          <div className="flex items-center justify-start w-full h-full p-2 gap-2 text-lg font-black">
            บริษัท ซื้อฮะฮวด อุตสาหกรรม จำกัด
          </div>
          <div className="flex items-center justify-start w-full h-full p-2 gap-2">
            9/1 หมู่ 2 ถนนบางเลน-ลาดหลุมแก้ว ต.ขุนศรี อ.ไทรน้อย จ.นนทบุรี 11150
            โทร:02-921-9979-80 แฟกซ์ 02-921-9978 WWW.CHHTHAILAND.COM
          </div>
        </div>
      </div>
      <div className="flex flex-col items-center justify-center w-full h-fit p-2 gap-2 border-b-2 border-default">
        <div className="flex items-center justify-start w-full h-full p-2 gap-2 font-black">
          เรียน คุณจงคม ชูชัยศรี
        </div>
        <div className="flex items-center justify-start w-full h-full p-2 gap-2 font-black">
          สำเนา คุณนวพล ชูเกียรติ
        </div>
        <div className="flex items-center justify-center w-full h-full p-2 gap-2 text-nowrap font-black">
          เรื่อง :
          <Input
            name="subject"
            type="text"
            placeholder="หัวข้อเรื่อง"
            color="default"
            variant="bordered"
            size="md"
            radius="md"
            isRequired
            value={formData.subject || ""}
            onChange={handleChange("subject")}
            isInvalid={!!errors.subject}
            errorMessage={errors.subject?.[0] || errors.subject}
          />
        </div>
        <div className="flex items-center justify-start w-full h-full p-2 gap-2 text-nowrap font-black">
          วันที่ :
          <Input
            name="date"
            type="date"
            color="default"
            variant="bordered"
            size="md"
            radius="md"
            isRequired
            value={formData.date || ""}
            onChange={handleChange("date")}
            isInvalid={!!errors.date}
            errorMessage={errors.date?.[0] || errors.date}
          />
        </div>
      </div>

      <div className="flex flex-col items-center justify-center w-full h-fit p-2 gap-2">
        <div className="flex items-center justify-start w-full h-full p-2 gap-2 text-nowrap font-black">
          เลขที่เอกสาร :
          <Input
            name="documentNo"
            type="text"
            placeholder="ME-XXXX-XX"
            color="default"
            variant="bordered"
            size="md"
            radius="md"
            isRequired
            value={formData.documentNo || ""}
            onChange={handleChange("documentNo")}
            isInvalid={!!errors.documentNo}
            errorMessage={errors.documentNo?.[0] || errors.documentNo}
          />
        </div>
        <div className="flex items-center justify-start w-10/12 h-full p-2 gap-2 text-nowrap">
          <Textarea
            name="content"
            placeholder="รายละเอียดเนื้อหา..."
            color="default"
            variant="bordered"
            size="md"
            radius="md"
            isRequired
            value={formData.content || ""}
            onChange={handleChange("content")}
            minRows={4}
            isInvalid={!!errors.content}
            errorMessage={errors.content?.[0] || errors.content}
          />
        </div>
        <div className="flex items-center justify-start w-10/12 h-full p-2 gap-2 text-nowrap font-black">
          เรียนมาเพื่อขออนุมัติ
        </div>
      </div>

      <div className="flex flex-col xl:flex-row items-center justify-center w-10/12 xl:min-h-52 p-2">
        <div className="flex flex-col items-center justify-center w-full h-full p-2 gap-2 border-2 border-default">
          <div className="flex items-center justify-center w-full h-full p-2 gap-2">
            {mode === "create" ? `  ${operatedBy}` : ` ${operatedBy}`}
          </div>
          <div className="flex items-center justify-center w-full h-full p-2 gap-2">
            ผู้ร้องขอ
          </div>
          <div className="flex items-center justify-center w-full h-full p-2 gap-2 text-nowrap">
            วันที่ :
            <Input
              name="requesterDate"
              type="date"
              color="default"
              variant="bordered"
              size="md"
              radius="md"
              value={formData.requesterDate || ""}
              onChange={handleChange("requesterDate")}
            />
          </div>
        </div>
        <div className="flex flex-col items-center justify-center w-full h-full p-2 gap-2 border-2 border-default">
          <div className="flex items-center justify-center w-full h-full p-2 gap-2">
            1
          </div>
          <div className="flex items-center justify-center w-full h-full p-2 gap-2">
            ผู้จัดการฝ่ายขาย
          </div>
          <div className="flex items-center justify-center w-full h-full p-2 gap-2 text-nowrap">
            วันที่ :
            <Input
              name="requesterDate"
              type="date"
              color="default"
              variant="bordered"
              size="md"
              radius="md"
              value={formData.requesterDate || ""}
              onChange={handleChange("requesterDate")}
            />
          </div>
        </div>
        <div className="flex flex-col items-center justify-center w-full h-full p-2 gap-2 border-2 border-default">
          <div className="flex items-center justify-center w-full h-full p-2 gap-2">
            1
          </div>
          <div className="flex items-center justify-center w-full h-full p-2 gap-2">
            กรรมการผู้จัดก
          </div>
          <div className="flex items-center justify-center w-full h-full p-2 gap-2 text-nowrap">
            วันที่ :
            <Input
              name="requesterDate"
              type="date"
              color="default"
              variant="bordered"
              size="md"
              radius="md"
              value={formData.requesterDate || ""}
              onChange={handleChange("requesterDate")}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-row items-center justify-end w-full h-fit p-2 gap-2">
        <div className="flex items-center justify-end w-full h-full p-2 gap-2">
          <Button
            type="submit"
            color="primary"
            variant="shadow"
            size="md"
            radius="md"
            startContent={<Save className="w-4 h-4" />}
            className="w-2/12 text-background"
          >
            {isUpdate ? "Update" : "Submit"}
          </Button>
        </div>
      </div>
    </form>
  );
}

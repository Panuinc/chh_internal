import { prisma } from "@/lib/prisma";

export class SalesMemoService {
  static async getAll({ limit = 100, offset = 0 } = {}) {
    const [memos, total] = await Promise.all([
      prisma.salesMemo.findMany({
        take: limit,
        skip: offset,
        orderBy: { memoCreatedAt: "desc" },
        include: {
          createdByEmployee: {
            select: {
              employeeFirstName: true,
              employeeLastName: true,
            },
          },
        },
      }),
      prisma.salesMemo.count(),
    ]);

    return {
      data: memos,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + memos.length < total,
      },
    };
  }

  static async getById(id) {
    return prisma.salesMemo.findUnique({
      where: { memoId: id },
      include: {
        createdByEmployee: {
          select: {
            employeeFirstName: true,
            employeeLastName: true,
          },
        },
        updatedByEmployee: {
          select: {
            employeeFirstName: true,
            employeeLastName: true,
          },
        },
      },
    });
  }

  static async getByDocumentNo(documentNo) {
    return prisma.salesMemo.findUnique({
      where: { memoDocumentNo: documentNo },
    });
  }

  static async create(data, createdBy) {
    const {
      documentNo,
      to,
      copy,
      subject,
      date,
      content,
      requesterName,
      requesterDate,
      salesManagerName,
      salesManagerDate,
      ceoName,
      ceoDate,
    } = data;

    return prisma.salesMemo.create({
      data: {
        memoDocumentNo: documentNo,
        memoTo: to,
        memoCopy: copy,
        memoSubject: subject,
        memoDate: new Date(date),
        memoContent: content,
        memoRequesterName: requesterName,
        memoRequesterDate: requesterDate,
        memoSalesManagerName: salesManagerName,
        memoSalesManagerDate: salesManagerDate,
        memoCeoName: ceoName,
        memoCeoDate: ceoDate,
        memoCreatedBy: createdBy,
      },
    });
  }

  static async update(id, data, updatedBy) {
    const {
      documentNo,
      to,
      copy,
      subject,
      date,
      content,
      requesterName,
      requesterDate,
      salesManagerName,
      salesManagerDate,
      ceoName,
      ceoDate,
    } = data;

    return prisma.salesMemo.update({
      where: { memoId: id },
      data: {
        memoDocumentNo: documentNo,
        memoTo: to,
        memoCopy: copy,
        memoSubject: subject,
        memoDate: new Date(date),
        memoContent: content,
        memoRequesterName: requesterName,
        memoRequesterDate: requesterDate,
        memoSalesManagerName: salesManagerName,
        memoSalesManagerDate: salesManagerDate,
        memoCeoName: ceoName,
        memoCeoDate: ceoDate,
        memoUpdatedBy: updatedBy,
        memoUpdatedAt: new Date(),
      },
    });
  }

  static async delete(id) {
    return prisma.salesMemo.delete({
      where: { memoId: id },
    });
  }
}

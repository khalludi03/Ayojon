import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { format } from 'date-fns'

interface InvoiceItem {
  id: string
  title: string
  quantity: number
  price: number
  variantInfo?: string
}

interface InvoiceData {
  orderNumber: string
  createdAt: string | Date
  shippingName: string
  shippingAddressLine1: string
  shippingAddressLine2?: string | null
  shippingCity: string
  shippingDivision: string
  shippingPostalCode: string
  shippingPhone: string
  paymentMethod: string
  subtotal: string | number
  shippingCost: string | number
  tax: string | number
  discount: string | number
  total: string | number
  items: Array<InvoiceItem>
  userEmail?: string
}

export const generateInvoicePDF = (data: InvoiceData) => {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()

  // Brand Colors (Coral Primary)
  const primaryColor = [240, 78, 55] // #F04E37 - Coral
  const secondaryColor = [51, 163, 153] // #33A399 - Teal
  const accentColor = [251, 171, 27] // #FBAB1B - Gold
  const darkGray = [30, 37, 50] // #1E2532
  const lightGray = [107, 114, 128] // #6B7280
  const bgLight = [250, 250, 250] // #FAFAFA

  // Helper for currency formatting
  const formatCurrency = (amount: string | number) => {
    return `৳ ${Number(amount).toLocaleString('en-BD')}`
  }

  // =======================
  // HEADER SECTION
  // =======================

  // Top accent bar
  doc.setFillColor(...primaryColor)
  doc.rect(0, 0, pageWidth, 8, 'F')

  // Logo and Company Name
  doc.setFontSize(32)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...primaryColor)
  doc.text('Ayojon', 20, 25)

  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...lightGray)
  doc.text('Event Marketplace', 20, 31)

  // INVOICE Title Box
  doc.setFillColor(...primaryColor)
  doc.roundedRect(pageWidth - 60, 15, 40, 12, 2, 2, 'F')
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(255, 255, 255)
  doc.text('INVOICE', pageWidth - 40, 23, { align: 'center' })

  // Invoice Details in a subtle box
  doc.setFillColor(...bgLight)
  doc.roundedRect(pageWidth - 80, 32, 60, 18, 2, 2, 'F')

  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...darkGray)
  doc.text('Invoice #:', pageWidth - 77, 38)
  doc.setFont('helvetica', 'normal')
  doc.text(`AYJ-${data.orderNumber}`, pageWidth - 77, 43)

  doc.setFont('helvetica', 'bold')
  doc.text('Date:', pageWidth - 77, 48)
  doc.setFont('helvetica', 'normal')
  doc.text(format(new Date(data.createdAt), 'dd MMM yyyy'), pageWidth - 77, 53)

  // Divider line
  doc.setDrawColor(...primaryColor)
  doc.setLineWidth(0.5)
  doc.line(20, 58, pageWidth - 20, 58)

  // =======================
  // ADDRESSES SECTION
  // =======================

  const addressY = 68

  // Bill To Section
  doc.setFillColor(...primaryColor)
  doc.rect(20, addressY, 3, 6, 'F')
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...darkGray)
  doc.text('BILL TO', 25, addressY + 4)

  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...darkGray)
  doc.text(data.shippingName, 20, addressY + 12)

  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...lightGray)
  const billToLines = [
    data.shippingAddressLine1,
    data.shippingAddressLine2 || '',
    `${data.shippingCity}, ${data.shippingDivision} ${data.shippingPostalCode}`,
    `Phone: ${data.shippingPhone}`,
    data.userEmail ? `Email: ${data.userEmail}` : '',
  ].filter(Boolean)
  doc.text(billToLines, 20, addressY + 18)

  // Ship To Section
  doc.setFillColor(...secondaryColor)
  doc.rect(110, addressY, 3, 6, 'F')
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...darkGray)
  doc.text('SHIP TO', 115, addressY + 4)

  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...darkGray)
  doc.text(data.shippingName, 110, addressY + 12)

  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...lightGray)
  const shipToLines = [
    data.shippingAddressLine1,
    data.shippingAddressLine2 || '',
    `${data.shippingCity}, ${data.shippingDivision} ${data.shippingPostalCode}`,
    `Phone: ${data.shippingPhone}`,
  ].filter(Boolean)
  doc.text(shipToLines, 110, addressY + 18)

  // =======================
  // ITEMS TABLE
  // =======================

  const tableData = data.items.map((item, index) => [
    (index + 1).toString(),
    item.title + (item.variantInfo ? `\n${item.variantInfo}` : ''),
    item.quantity.toString(),
    formatCurrency(item.price),
    formatCurrency(item.quantity * item.price),
  ])

  autoTable(doc, {
    startY: addressY + 45,
    head: [['#', 'Item Description', 'Qty', 'Unit Price', 'Total']],
    body: tableData,
    theme: 'plain',
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontSize: 10,
      fontStyle: 'bold',
      cellPadding: { top: 6, right: 8, bottom: 6, left: 8 },
    },
    styles: {
      fontSize: 9,
      cellPadding: { top: 8, right: 8, bottom: 8, left: 8 },
      lineColor: [229, 229, 229],
      lineWidth: 0.1,
    },
    columnStyles: {
      0: {
        cellWidth: 12,
        halign: 'center',
        fontStyle: 'bold',
        textColor: lightGray,
      },
      1: { cellWidth: 'auto' },
      2: { cellWidth: 18, halign: 'center' },
      3: { cellWidth: 35, halign: 'right' },
      4: {
        cellWidth: 35,
        halign: 'right',
        fontStyle: 'bold',
        textColor: darkGray,
      },
    },
    alternateRowStyles: {
      fillColor: bgLight,
    },
  })

  const finalY = (doc as any).lastAutoTable?.finalY || 150

  // =======================
  // PAYMENT & SUMMARY
  // =======================

  const summaryY = finalY + 15

  // Payment Method Box
  doc.setFillColor(...bgLight)
  doc.roundedRect(20, summaryY, 70, 22, 2, 2, 'F')

  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...darkGray)
  doc.text('PAYMENT METHOD', 25, summaryY + 6)

  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...primaryColor)
  doc.text(data.paymentMethod.toUpperCase(), 25, summaryY + 14)

  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...lightGray)
  doc.text('Payment processed securely', 25, summaryY + 19)

  // Summary Box
  const summaryBoxX = pageWidth - 85
  doc.setFillColor(...bgLight)
  doc.roundedRect(
    summaryBoxX,
    summaryY,
    65,
    Number(data.discount) > 0 ? 42 : 36,
    2,
    2,
    'F',
  )

  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...darkGray)
  let lineY = summaryY + 7

  doc.text('Subtotal:', summaryBoxX + 5, lineY)
  doc.text(formatCurrency(data.subtotal), summaryBoxX + 60, lineY, {
    align: 'right',
  })
  lineY += 6

  doc.text('Shipping:', summaryBoxX + 5, lineY)
  doc.text(formatCurrency(data.shippingCost), summaryBoxX + 60, lineY, {
    align: 'right',
  })
  lineY += 6

  doc.text('Tax & VAT:', summaryBoxX + 5, lineY)
  doc.text(formatCurrency(data.tax), summaryBoxX + 60, lineY, {
    align: 'right',
  })
  lineY += 6

  if (Number(data.discount) > 0) {
    doc.setTextColor(...secondaryColor)
    doc.text('Discount:', summaryBoxX + 5, lineY)
    doc.text(`-${formatCurrency(data.discount)}`, summaryBoxX + 60, lineY, {
      align: 'right',
    })
    doc.setTextColor(...darkGray)
    lineY += 6
  }

  // Divider
  doc.setDrawColor(...primaryColor)
  doc.setLineWidth(0.5)
  doc.line(summaryBoxX + 5, lineY + 1, summaryBoxX + 60, lineY + 1)
  lineY += 7

  // Grand Total
  doc.setFillColor(...primaryColor)
  doc.roundedRect(summaryBoxX, lineY - 4, 65, 10, 2, 2, 'F')
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(255, 255, 255)
  doc.text('GRAND TOTAL', summaryBoxX + 5, lineY + 2)
  doc.setFontSize(12)
  doc.text(formatCurrency(data.total), summaryBoxX + 60, lineY + 2, {
    align: 'right',
  })

  // =======================
  // FOOTER
  // =======================

  const footerY = pageHeight - 35

  // Footer background
  doc.setFillColor(...bgLight)
  doc.rect(0, footerY - 5, pageWidth, 40, 'F')

  // Accent line
  doc.setDrawColor(...primaryColor)
  doc.setLineWidth(1)
  doc.line(20, footerY - 5, pageWidth - 20, footerY - 5)

  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...darkGray)
  doc.text('TERMS & CONDITIONS', 20, footerY + 3)

  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...lightGray)
  doc.text(
    [
      '• This is a computer-generated invoice and does not require a signature.',
      '• Goods once sold are not returnable unless there is a manufacturing defect.',
      '• For any queries, contact us at support@ayojon.com or call +880 1234 567890.',
    ],
    20,
    footerY + 9,
  )

  // Thank you message
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bolditalic')
  doc.setTextColor(...primaryColor)
  doc.text('Thank you for your business!', pageWidth / 2, footerY + 27, {
    align: 'center',
  })

  // =======================
  // SAVE & OPEN
  // =======================

  const fileName = `Invoice_AYJ_${data.orderNumber}.pdf`
  doc.setProperties({
    title: fileName,
    subject: `Invoice for Order #${data.orderNumber}`,
    author: 'Ayojon Event Marketplace',
    keywords: 'invoice, order, ayojon',
    creator: 'Ayojon Invoicing System',
  })

  // Open in new tab
  const blob = doc.output('blob')
  const url = URL.createObjectURL(blob)
  window.open(url, '_blank')
}

import React, { useState, useEffect } from "react";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import { saveAs } from "file-saver";
import converter from "number-to-words";
import VehicleDropdown from "./VehicleDropdown";
import "./App.css";

export default function App() {

  const today = new Date().toISOString().split("T")[0]; // "2025-09-12"
  const [form, setForm] = useState({
    weight: "",
    rate: "",
    vehicleNo: "",
    invoiceNum: "",
    date: today,
  });

  const [lastInvoice, setLastInvoice] = useState(211);

  useEffect(() => {
    const storedInvoice = localStorage.getItem("lastInvoice");
    const nextInvoice = storedInvoice ? parseInt(storedInvoice) + 1 : 211;
    setForm((prev) => ({ ...prev, invoiceNum: nextInvoice.toString() }));
    setLastInvoice(nextInvoice);
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const formatDate = (isoDate) => {
    if (!isoDate) return "";
    const [year, month, day] = isoDate.split("-");
    return `${day}-${month}-${year}`; // "12-09-2025"
  };

  // const toFixed2 = (num) => {
  //   return parseFloat(Number(num).toFixed(2));
  // };

  const weight = parseFloat(form.weight) || 0;
  const rate = parseFloat(form.rate) || 0;

  const amount = weight * rate;
  const gst = amount * 0.05;
  const total = amount + gst;

  // const numberToWords = (num) => {
  //   if (!num) return "";
  //   let words = converter.toWords(num);
  //   return words.charAt(0).toUpperCase() + words.slice(1) + " only";
  // };

  const numberToWords = (num) => {
    if (num === null || num === undefined || isNaN(num)) return "";

    const integerPart = Math.floor(num);
    const decimalPart = Math.round((num - integerPart) * 100); // up to 2 decimal places

    let words = converter.toWords(integerPart) + " rupees";

    if (decimalPart > 0) {
      words += " and " + converter.toWords(decimalPart) + " paise";
    }

    return words.charAt(0).toUpperCase() + words.slice(1) + " only";
  };


  const generateDocx = async () => {
    if (!form.weight || !form.rate || !form.vehicleNo || !form.date) {
      alert("Please fill all fields before generating the bill.");
      return;
    }

    if (total > 50000) {
      alert("Grand total exceeds 50000."); // why this didn't worked
      return;
    }


    const response = await fetch("/bill_template.docx");
    const buffer = await response.arrayBuffer();

    const zip = new PizZip(buffer);
    const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true });

    doc.render({
      type1: "Original",
      type2: "Duplicate",
      invoiceNum: form.invoiceNum,
      date: formatDate(form.date),
      vehicleNo: form.vehicleNo,
      weight: weight.toFixed(2),
      rate: rate.toFixed(2),
      amount: amount.toFixed(2),
      gst: gst.toFixed(2),
      total: total.toFixed(2),
      words: numberToWords(total),
    });

    const blob = doc.getZip().generate({ type: "blob" });
    saveAs(blob, `Invoice_${form.invoiceNum}.docx`);


    // const response = await fetch("/word_template.docx");
    // const buffer = await response.arrayBuffer();

    // const createDoc = () => {
    //   const zip = new PizZip(buffer);
    //   const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true });
    //   doc.render({
    //     type1: "Original",
    //     type2: "Duplicate",
    //     invoiceNum: form.invoiceNum,
    //     date: form.date,
    //     vehicleNo: form.vehicleNo,
    //     weight: form.weight,
    //     rate: form.rate,
    //     amount,
    //     gst,
    //     total,
    //     words: numberToWords(total),
    //   });
    //   return doc.getZip().files["word/document.xml"].asText();
    // };

    // const xml1 = createDoc();
    // // const xml2 = createDoc("Duplicate");

    // // const mergedXml =
    // //   xml1.replace("</w:body></w:document>", "") +
    // //   '<w:p><w:r><w:br w:type="page"/></w:r></w:p>' +
    // //   xml2.substring(xml2.indexOf("<w:body>") + 8);

    // // const zip = new PizZip(buffer);
    // // zip.file("word/document.xml", mergedXml);

    // const blob = zip.generate({ type: "blob" });
    // saveAs(blob, `Invoice_${form.invoiceNum}.docx`);

    // Increment invoice number for next bill
    const nextInvoice = parseInt(form.invoiceNum) + 1;
    localStorage.setItem("lastInvoice", nextInvoice);
    setForm((prev) => ({ ...prev, invoiceNum: nextInvoice.toString() }));
  };

  // const printPreview = () => {
  //   const printContents = document.getElementById("invoicePreview").innerHTML;
  //   const originalContents = document.body.innerHTML;
  //   document.body.innerHTML = printContents;
  //   window.print();
  //   document.body.innerHTML = originalContents;
  //   window.location.reload(); // reload to restore React state
  // };

  return (
    <div className="container">
      <div className="card">
        <h2>GST Bill Generator</h2>

        <div className="form-grid">
          <input
            type="text"
            name="invoiceNum"
            placeholder="Invoice No."
            value={form.invoiceNum}
            onChange={handleChange}
          />
          {/* <input
            type="text"
            name="vehicleNo"
            placeholder="Vehicle No."
            value={form.vehicleNo}
            onChange={handleChange}
          /> */}
          <VehicleDropdown
            value={form.vehicleNo}
            onChange={(val) => setForm({ ...form, vehicleNo: val })}
            options={["HR38AB2252", "HR38AB7865", "HR38AD0861", "HR38X6147", "HR38W6681", "HR38AC5110", "HR38Y5089", "HR38W0268", "HR38X2968"]}
          />
          <input
            type="number"
            name="weight"
            placeholder="Weight"
            value={form.weight}
            onChange={handleChange}
          />
          <input
            type="number"
            name="rate"
            placeholder="Rate"
            value={form.rate}
            onChange={handleChange}
          />
          <input
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
          />
        </div>

        <div id="invoicePreview" className="preview">
          <h3>Invoice Preview</h3>

          <div className="invoicePreviewWrapper">
            <div>
              <p><strong>Invoice No:</strong> {form.invoiceNum}</p>
              <p><strong>Date:</strong> {formatDate(form.date)}</p>
              <p><strong>Vehicle No:</strong> {form.vehicleNo}</p>
              <p><strong>Weight:</strong> {weight}</p>
              <p><strong>Rate:</strong> ₹{rate}</p>
            </div>
            <div>
              <p><strong>Amount:</strong> ₹{amount.toFixed(2)}</p>
              <p><strong>GST (5%):</strong> ₹{gst.toFixed(2)}</p>
              <p><strong>Total:</strong> ₹{total.toFixed(2)}</p>
            </div>
          </div>
          <p className="words">{numberToWords(total)}</p>
        </div>

        <div className="buttons">
          <button onClick={generateDocx}>Generate Bill</button>
          {/* <button className="print-btn" onClick={printPreview}>Print Preview</button> */}
        </div>
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { X } from 'lucide-react';

interface QrModalProps {
  value: string;
  title: string;
  onClose: () => void;
}

export function QrModal({ value, title, onClose }: QrModalProps) {
  const [dataUrl, setDataUrl] = useState('');

  useEffect(() => {
    QRCode.toDataURL(`https://${value.replace(/^https?:\/\//, '')}`, {
      width: 320,
      margin: 2,
      color: { dark: '#2A2342', light: '#FFFFFF' },
    })
      .then(setDataUrl)
      .catch(() => setDataUrl(''));
  }, [value]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[rgba(28,22,51,.5)] p-4"
      onClick={onClose}
    >
      <div
        className="card w-full max-w-[340px] p-6 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-[17px] font-extrabold">{title}</h3>
          <button onClick={onClose} className="text-muted-faint hover:text-ink" aria-label="إغلاق">
            <X size={20} />
          </button>
        </div>
        {dataUrl ? (
          <img src={dataUrl} alt="QR" className="mx-auto rounded-2xl border border-line" width={260} height={260} />
        ) : (
          <div className="mx-auto h-[260px] w-[260px] animate-pulse rounded-2xl bg-surface" />
        )}
        <p dir="ltr" className="mt-4 break-all text-[13px] font-bold text-primary">
          {value}
        </p>
        <p className="mt-2 text-[12.5px] font-semibold text-muted-soft">امسح الرمز للوصول إلى الرابط</p>
      </div>
    </div>
  );
}

import './Spinner.css';

export default function Spinner({ text = 'Đang tải...' }) {
  return (
    <div className="spinner-wrapper">
      <div className="spinner-ring" />
      <p className="spinner-text">{text}</p>
    </div>
  );
}

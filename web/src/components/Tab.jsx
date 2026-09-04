export const Tab = ({ tabs, activeTab, onChange }) => {
  return (
    <div className="flex border-b">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onChange(tab)}
          className={`pb-2 px-4 ${activeTab === tab ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
};

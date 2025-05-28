export function QuoteForm() {
  return (
    <div style="max-width: 500px; margin: 20px auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
      <h2>添加留言</h2>
      <form action="/submit-quote" method="post" style="display: flex; flex-direction: column; gap: 15px;">
        <div>
          <label for="name" style="display: block; margin-bottom: 5px; font-weight: bold;">姓名:</label>
          <input 
            type="text" 
            id="name" 
            name="name" 
            required 
            style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;"
          />
        </div>
        
        <div>
          <label for="email" style="display: block; margin-bottom: 5px; font-weight: bold;">邮箱:</label>
          <input 
            type="email" 
            id="email" 
            name="email" 
            required 
            style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;"
          />
        </div>
        
        <div>
          <label for="message" style="display: block; margin-bottom: 5px; font-weight: bold;">留言:</label>
          <textarea 
            id="message" 
            name="message" 
            required 
            rows={4}
            style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px; resize: vertical;"
          />
        </div>
        
        <button 
          type="submit" 
          style="padding: 10px 20px; background-color: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 16px;"
        >
          提交留言
        </button>
      </form>
    </div>
  )
} 
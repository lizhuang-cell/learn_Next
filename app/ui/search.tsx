'use client';

import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useState , useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter , usePathname} from 'next/navigation';
import {useDebouncedCallback} from 'use-debounce';
export default function Search({ placeholder }: { placeholder: string }) {
  const [value, setValue] = useState('');
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const {replace} = useRouter()
  const handlerInput = useDebouncedCallback((value:string) => {
    // setValue(value);
    const params = new URLSearchParams(searchParams);
    params.set('page', '1')
    if(value.trim()){
      params.set('query', value);
      
    }else{
      params.delete('query');
    }

    const href = `${pathname}?${params.toString()}`;
    replace(href)
    
  }, 200);


  // 此时打印时数据为上一次的数据
  // 1. 状态更新是异步的：setValue() 调用后，状态不会立即更新。React
  // 会将状态更新排入队列，在下一次渲染时才生效。
  // 2. 闭包捕获旧值：console.log(value) 打印的是当前闭包中捕获的 value 值，而不是        
  // setValue() 之后的新值。这个 value 是组件本次渲染时的快照。
  useEffect(() => {
    setValue(searchParams.get('query') || '');
    console.log('%c [ value ]: ', 'color: #bf2c9f; background: pink; font-size: 13px;', value)
  }, [searchParams]);
  return (
    <div className="relative flex flex-1 flex-shrink-0">
      <label htmlFor="search" className="sr-only">
        Search
      </label>
      <input
        value={value}
        className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
        placeholder={placeholder}
        onChange={(e)=>handlerInput(e.target.value)}
      />
      <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
    </div>
  );
}

## kotlin

### 基础语法

```kotlin
fun main() {
    var s : Int;  //var 可变
    s = 10; 
    var t = 10; // 可以直接赋值不标明类型
    val u = s + t; // val 不可变
    
    var name = "11";
    println("dsadad ${name}"); //可以用这种方法写字符串
    println("hello wprld ${System.currentTimeMillis()}")
}
```

### 条件语句

```kotlin
fun main()  {
    try {
        var s = Random.nextInt(7)
        var str : String  = if(s  > 10){
            "111"
        }else{
            "222"
        }  // kotlin的if else 是可以赋值的
        println(str)
        var EnumShow : enumShow = enumShow.entries.get(2);
        var str1 : String =  when(EnumShow){ 
            enumShow.red -> "red"
            enumShow.blue -> "blue"
            enumShow.green -> "green"
        }// kotlin的when 是可以赋值的  -> when 类似于 switch
        println(str1)

        var number : Int = Random.nextInt(100);
        when{  // when -> if else 来使用 
            number > 50 -> println("number > 50")
            number == 50 -> println("number == 50")
            number < 50 -> println("number < 50")
        }
    } catch (e: Exception) {
        println(e.message)
    }
}

enum  class enumShow{
    red, blue, green
}

```

### 函数

```kotlin
fun doIt(a : Int) : Int{
    return a * 2
}

fun  doIt2(a : Int) : Int = a * 2  //只有一句话可以简写

fun doIt3(){
    println("doIt3")
}
```

### 循环

```kotlin
   var  list1 : List<Int> = listOf(1,2,3,4,5)
        for(i in list1){ // 不能使用 ;;
            println(i)
        }
        for(i in 1..5){
            println(i)
        }
        var i : Int = 0;
        while(i < 5){ // 这里边 参数 不能类似于Java使用 = 赋值
            println(i)
        }
```

###  空值动用

```kotlin
 var readlnOrNull = readlnOrNull() //可空  声明带问号是可空
        if(readlnOrNull != null){
            readlnOrNull.trim()
        }
        var string : String  = (readlnOrNull ?: "").trim() //只有在处理完空值情况才能调用不可空的方法

        var randomPlayer = randomPlayer("111")
        if(randomPlayer != null){
            randomPlayer.kick()
        }
        randomPlayer("111")?.kick() //前边为空执行前边的值 ，前边不为空执行后边方法



class Test11(
    var code : Int,
    var name : String
    ){
    fun kick(){
        println("kick")
    }
   }

fun randomPlayer(name: String): Test11?{
    if (name.length < 5) {
        return Test11(100, name)
    }else{
        return null
    }
}
```

### 类

```kotlin
open -> 可以被继承
kotlin 要求属性初始化

package com

class Test3 constructor ( // 可以直接参数构造化
    var code : Int,
    var name : String
){   //直接再里边构造需要赋值
    fun kick(){
        println("${code} kick")
    }

    init{
        code = 1000 // 后续初始化
    }

    //静态
    companion object{   //静态函数 可以直接类访问
        var code : Int = 10001
    }
}


open interface ITest{ 。//open才可以被继承
    fun doIt();
    fun doIt2(){
        println("doIt2")
    };
}

class Test5 : ITest {

    init {
        println("init")
    }
    override fun doIt() {
        println("doIt")
        var k = 1
    }
}

class Test4 (
    var code : Int,
    var name : String
){
    fun kick(){
        println("${name} kick")
    }
}

fun main(){
    var test3 = Test3(1,"111")
    test3.kick()
    var test4 = Test4(100, "222")
    test4.kick()
    println(Test3.code)
    var test5 = Test5()
    test5.doIt()
   }


```



###  可变不可变类型

```kotlin
fun main(){
    var list1 : List<Int> = listOf(1,2,3,4,5)//不可修改的
    println(list1[1])

    var list2 : MutableList<Int> = mutableListOf(1,2,3,4,5) // 可以修改的  map set 都是如此
    list2.add(1)


    var intArrayOf = intArrayOf(1, 2, 3, 4, 5)
    println(intArrayOf.get(1))

    var byteArrayOf = byteArrayOf(1, 2, 3, 4, 5)

    var mapOf = mapOf<Int, Int>(
        1 to 1,
        2 to 2,   //lambda表达式  ->
        3 to 3,
    )
}
```



### lanbada

```kotlin
fun main() {
    //lambda表达式
    var lambda = BiConsumer<Int, Int> { x, y ->
        println(x + y)
    }
    var Map =  mapOf<Int, Int>(
        1 to 1,
        2 to 2,
        3 to 3,
        4 to 4,
        5 to 5,
        6 to 6,
    )
    Map.forEach(lambda)
    Map.forEach { x,y -> println(x + y) }

    var list1 : List<Int> = listOf(1,2,3,4,5)

    val test : (Int) -> Unit = { x ->
        println(x)
    }
    list1.forEach(test)
    
    
    list1.forEach({
        x -> println(x)
    })
    list1.forEach ({
        println(it)
    })

}
```

### 重载运算符  + 中缀表示法

``` kotlin
// kotlin    java
//  ==      .eauals()
// ===       ==  java值或对象地址
//kotlin 位运算没有 ——>对应函数
//infix 中缀表示法 -> 简化  中缀表示法允许你以 A 函数名 B 的形式调用函数，省略点号和括号，使代码更接近自然语言
```

### 标准库函数

Kotlin 标准库内置的常用函数，用于简化代码、作用域控制、空安全等。例如：

- **作用域函数**：`let`、`apply`、`run`、`also`、`with`，在对象上下文中执行代码块。
- **其他**：`repeat`（重复执行）、`takeIf`/`takeUnless`（条件过滤）、`TODO`（标记未完成）。

### 集合操作

对 `List`、`Set`、`Map` 等集合的函数式操作，无需手动循环。例如：

- **转换**：`map`、`flatMap`
- **过滤**：`filter`、`distinct`
- **聚合**：`reduce`、`sumOf`
- **排序**：`sortedBy`、`sorted`
- **分组**：`groupBy`
- **遍历**：`forEach`

两者常结合使用

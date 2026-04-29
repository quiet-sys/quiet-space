>
>
>@SpringbootAplication
>
>@Autowired   ： 自动装填对象
>
>@Service  : 
>
>@Respository
>
>@Controller
>
>@RestController
>
>#Configuration
>
>@Bean
>
>@RequestMapping
>
>@GetMapping
>
>@PostMapping
>
>@DeleteMapping
>
>@Pathvariable
>
>@RequestParam
>
>@RequsetBody
>
>@value
>
>@ConfigrationPropeties
>
>





| 注解                     | 作用                           | 用在什么地方         |
| ------------------------ | ------------------------------ | -------------------- |
| @SpringBootApplication   | Spring Boot 启动入口、自动配置 | 启动类    1          |
| @Autowired               | 自动注入 Bean                  | 属性/构造/方法       |
| @Service                 | 注册业务层 Bean                | Service 类    1      |
| @Repository              | 注册 DAO 层 Bean + 异常转译    | Repository/Mapper 类 |
| @Controller              | 控制器（返回页面）             | Controller 类  1     |
| @RestController          | REST API 控制器（返回 JSON）   | Controller 类  1     |
| @Configuration           | 声明配置类                     | 配置类               |
| @Bean                    | 手动注册 Bean                  | 配置类的方法上       |
| @RequestMapping          | 定义 URL 路径                  | 类 / 方法            |
| @GetMapping              | GET 请求                       | Controller 方法 1    |
| @PostMapping             | POST 请求                      | Controller 方法  1   |
| @DeleteMapping           | DELETE 请求                    | Controller 方法  1   |
| @PathVariable            | URL 路径参数                   | 方法参数位置         |
| @RequestParam            | 表单 / URL 参数                | 方法参数             |
| @RequestBody             | 接收 JSON                      | 方法参数             |
| @Value                   | 读取配置文件中的值             | 成员变量             |
| @ConfigurationProperties | 批量绑定配置项                 | 配置类或组件上       |